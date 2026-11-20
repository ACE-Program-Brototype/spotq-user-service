import { randomUUID } from "node:crypto";
import { config } from "@config/env.ts";
import type {
	IEmailQueueProducer,
	QueueVerificationEmailParams,
} from "@domain/repository/shared/IEmail.queue.producer";
import { logger, loggerLocalStorage } from "@infrastructure/logger/index.ts";
import { Queue } from "bullmq";
import { injectable } from "inversify";
import { Redis } from "ioredis";

export const EMAIL_QUEUE_NAME = "email-verification-queue";

@injectable()
export class EmailQueueProducer implements IEmailQueueProducer {
	private queue: Queue | null = null;
	private connection: Redis | null = null;

	private getQueue(): Queue {
		if (!this.queue) {
			this.connection = new Redis(config.redis.url, {
				maxRetriesPerRequest: null,
				enableOfflineQueue: false,
				tls: config.redis.url.startsWith("rediss://") ? {} : undefined,
			});

			this.queue = new Queue(EMAIL_QUEUE_NAME, {
				connection: this.connection,
				defaultJobOptions: {
					attempts: 3,
					backoff: {
						type: "exponential",
						delay: 2000,
					},
					removeOnComplete: true,
					removeOnFail: false,
				},
			});
		}

		return this.queue;
	}

	public async queueVerificationEmail(
		params: QueueVerificationEmailParams,
	): Promise<void> {
		const store = loggerLocalStorage.getStore();
		const correlationId = store?.correlationId || randomUUID();

		try {
			await this.getQueue().add("send-verification-email", {
				email: params.email,
				otp: params.otp,
				correlationId,
			});

			logger.info(
				{
					event: { action: "EMAIL_OTP_QUEUED" },
					context: { email: params.email },
				},
				"Verification email job successfully queued in BullMQ",
			);
		} catch (error) {
			logger.error(
				{
					err: error,
					event: { action: "EMAIL_OTP_QUEUE_FAILED" },
					context: { email: params.email },
				},
				"Failed to queue verification email in BullMQ",
			);

			throw error;
		}
	}

	public async close(): Promise<void> {
		try {
			if (this.queue) {
				await this.queue.close();
				this.queue = null;
			}

			if (this.connection) {
				await this.connection.quit();
				this.connection = null;
			}

			logger.info(
				{ event: "EMAIL_QUEUE_PRODUCER_CLOSED" },
				"Email queue producer closed successfully",
			);
		} catch (error) {
			logger.error(
				{
					err: error,
					event: "EMAIL_QUEUE_PRODUCER_CLOSE_FAILED",
				},
				"Failed to close email queue producer",
			);

			throw error;
		}
	}
}
