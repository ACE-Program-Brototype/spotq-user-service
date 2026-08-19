import type {
	IEmailQueueProducer,
	QueueVerificationEmailParams,
} from "@application/ports/services/email-queue-producer.interface.ts";
import type { ILogger } from "@application/ports/services/logger.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { config } from "@config/env.ts";
import { QUEUE_LIMITS } from "@shared/constants/index.ts";
import { Queue } from "bullmq";
import { inject, injectable } from "inversify";
import { Redis } from "ioredis";

export const EMAIL_QUEUE_NAME = "email-verification-queue";

@injectable()
export class EmailQueueProducer implements IEmailQueueProducer {
	private _queue: Queue | null = null;

	constructor(
		@inject(TYPES.Logger)
		private readonly _logger: ILogger,
	) {}

	private getQueue(): Queue {
		if (!this._queue) {
			const connection = new Redis(config.redis.url, {
				maxRetriesPerRequest: null,
				enableOfflineQueue: false,
				tls: config.redis.url.startsWith("rediss://") ? {} : undefined,
			});

			this._queue = new Queue(EMAIL_QUEUE_NAME, {
				connection,
				defaultJobOptions: {
					attempts: QUEUE_LIMITS.EMAIL.ATTEMPTS,
					backoff: {
						type: "exponential",
						delay: QUEUE_LIMITS.EMAIL.BACKOFF_DELAY,
					},
					removeOnComplete: true,
					removeOnFail: false,
				},
			});
		}
		return this._queue;
	}

	public async queueVerificationEmail(
		params: QueueVerificationEmailParams,
	): Promise<void> {
		try {
			await this.getQueue().add("send-verification-email", {
				email: params.email,
				otp: params.otp,
			});
			this._logger.info(
				{ email: params.email, event: "EMAIL_OTP_QUEUED" },
				"Verification email job successfully queued in BullMQ",
			);
		} catch (error) {
			this._logger.error(
				{ err: error, email: params.email, event: "EMAIL_OTP_QUEUE_FAILED" },
				"Failed to queue verification email in BullMQ",
			);
			throw error;
		}
	}

	public async close(): Promise<void> {
		if (this._queue) {
			await this._queue.close();
			this._queue = null;
		}
	}
}
