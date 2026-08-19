import { config } from "@config/env.ts";
import { BrevoClient } from "@getbrevo/brevo";
import type { IEmailService } from "@infrastructure/interface/shared/IEmail.service";
import { logger } from "@infrastructure/logger/logger.ts";
import { renderVerificationOtpTemplate } from "@infrastructure/template/email.template";
import { injectable } from "inversify";

@injectable()
export class BrevoEmailService implements IEmailService {
	private readonly client: BrevoClient;

	constructor() {
		this.client = new BrevoClient({
			apiKey: config.brevo.apiKey,
		});
	}

	public async sendVerificationEmail(
		toEmail: string,
		otp: string,
	): Promise<void> {
		try {
			const { subject, htmlContent } = renderVerificationOtpTemplate({
				otp,
				validityMinutes: 5,
			});

			await this.client.transactionalEmails.sendTransacEmail({
				sender: {
					name: config.brevo.senderName,
					email: config.brevo.senderEmail,
				},
				to: [{ email: toEmail }],
				subject,
				htmlContent,
			});

			logger.info(
				{ toEmail, event: "EMAIL_VERIFICATION_SENT" },
				"Verification email sent successfully via Brevo",
			);
		} catch (error) {
			logger.error(
				{ err: error, toEmail, event: "EMAIL_DELIVERY_FAILED" },
				"Failed to deliver verification email via Brevo",
			);
			throw error;
		}
	}
}
