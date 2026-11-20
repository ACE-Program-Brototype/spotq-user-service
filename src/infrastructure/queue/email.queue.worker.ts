import { randomUUID } from "node:crypto";
import type { IEmailService } from "@application/ports/services/email-service.interface.ts";
import { config } from "@config/env.ts";
import { logger, loggerLocalStorage } from "@infrastructure/logger/index.ts";
import { type Job, Worker } from "bullmq";
import { injectable } from "inversify";
import { Redis } from "ioredis";
import { EMAIL_QUEUE_NAME } from "./email.queue.producer.ts";

export interface EmailJobData {
	email: string;
	otp: string;
	correlationId?: string;
}

@injectable()
export class EmailQueueWorker {
	private worker: Worker<EmailJobData> | null = null;

	public start(emailService: IEmailService): void {
		if (
			this.worker ||
			process.env.NODE_ENV === "test" ||
			process.env.NODE_ENV === "testing"
		) {
			return;
		}

		const connection = new Redis(config.redis.url, {
			maxRetriesPerRequest: null,
			enableOfflineQueue: false,
			tls: config.redis.url.startsWith("rediss://") ? {} : undefined,
		});

		this.worker = new Worker<EmailJobData>(
			EMAIL_QUEUE_NAME,
			async (job: Job<EmailJobData>) => {
				const correlationId = job.data.correlationId || randomUUID();
				const startTime = process.hrtime.bigint();

				await loggerLocalStorage.run(
					{ correlationId, requestId: correlationId },
					async () => {
						logger.debug(
							{
								job: {
									queue: EMAIL_QUEUE_NAME,
									routing_key: job.name,
									job_id: job.id,
									status: "PROCESSING",
								},
								context: {
									email: job.data.email,
								},
							},
							`Processing queue message '${job.name}'`,
						);

						await emailService.sendVerificationEmail(
							job.data.email,
							job.data.otp,
						);

						const endTime = process.hrtime.bigint();
						const durationMs =
							Math.round((Number(endTime - startTime) / 1_000_000) * 10) / 10;

						logger.info(
							{
								job: {
									queue: EMAIL_QUEUE_NAME,
									routing_key: job.name,
									job_id: job.id,
									duration_ms: durationMs,
									status: "SUCCESS",
								},
								context: {
									email: job.data.email,
								},
							},
							`Processed queue message '${job.name}'`,
						);
					},
				);
			},
			{
				connection,
				concurrency: 5,
			},
		);

		this.worker.on("failed", (job, err) => {
			const correlationId = job?.data?.correlationId || randomUUID();
			loggerLocalStorage.run(
				{ correlationId, requestId: correlationId },
				() => {
					logger.error(
						{
							err,
							job: {
								queue: EMAIL_QUEUE_NAME,
								routing_key: job?.name || "send-verification-email",
								job_id: job?.id,
								status: "FAILED",
							},
							context: {
								email: job?.data?.email,
							},
						},
						`Queue message '${job?.name}' failed`,
					);
				},
			);
		});
	}

	public async close(): Promise<void> {
		if (this.worker) {
			await this.worker.close();
			this.worker = null;
		}
	}
}
