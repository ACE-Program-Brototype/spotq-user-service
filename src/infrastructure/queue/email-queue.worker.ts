import type { IEmailService } from "@application/ports/services/email-service.interface.ts";
import type { ILogger } from "@application/ports/services/logger.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { config } from "@config/env.ts";
import { QUEUE_LIMITS } from "@shared/constants/index.ts";
import { type Job, Worker } from "bullmq";
import { inject, injectable } from "inversify";
import { Redis } from "ioredis";
import { EMAIL_QUEUE_NAME } from "./email-queue.producer.ts";

export interface EmailJobData {
	email: string;
	otp: string;
}

@injectable()
export class EmailQueueWorker {
	private worker: Worker<EmailJobData> | null = null;

	constructor(
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

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
				this.logger.info(
					{ jobId: job.id, email: job.data.email },
					"Processing email verification BullMQ job",
				);
				await emailService.sendVerificationEmail(job.data.email, job.data.otp);
			},
			{
				connection,
				concurrency: QUEUE_LIMITS.EMAIL.CONCURRENCY,
			},
		);

		this.worker.on("completed", (job) => {
			this.logger.info(
				{ jobId: job.id, email: job.data.email },
				"Email verification job completed",
			);
		});

		this.worker.on("failed", (job, err) => {
			this.logger.error(
				{ jobId: job?.id, email: job?.data?.email, err },
				"Email verification job failed",
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
