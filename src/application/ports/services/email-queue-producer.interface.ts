export interface QueueVerificationEmailParams {
	email: string;
	otp: string;
}

export interface IEmailQueueProducer {
	queueVerificationEmail(params: QueueVerificationEmailParams): Promise<void>;
}
