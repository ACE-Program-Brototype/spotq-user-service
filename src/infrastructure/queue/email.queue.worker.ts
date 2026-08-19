import { config } from "@config/env.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { type Job, Worker } from "bullmq";
import { injectable } from "inversify";
import { Redis } from "ioredis";
import { EMAIL_QUEUE_NAME } from "./email.queue.producer";
import { IEmailService } from "@application/ports/service/IEmail.service";

export interface EmailJobData {
	email: string;
	otp: string;
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
				logger.info(
					{ jobId: job.id, email: job.data.email },
					"Processing email verification BullMQ job",
				);
				await emailService.sendVerificationEmail(job.data.email, job.data.otp);
			},
			{
				connection,
				concurrency: 5,
			},
		);

		this.worker.on("completed", (job) => {
			logger.info(
				{ jobId: job.id, email: job.data.email },
				"Email verification job completed",
			);
		});

		this.worker.on("failed", (job, err) => {
			logger.error(
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
