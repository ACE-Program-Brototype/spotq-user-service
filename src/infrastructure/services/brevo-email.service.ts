import type { IEmailService } from "@application/ports/services/email-service.interface.ts";
import { config } from "@config/env.ts";
import { BrevoClient } from "@getbrevo/brevo";
import { logger } from "@infrastructure/logger/logger.ts";
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
			await this.client.transactionalEmails.sendTransacEmail({
				sender: {
					name: config.brevo.senderName,
					email: config.brevo.senderEmail,
				},
				to: [{ email: toEmail }],
				subject: "SpotQ - Verify Your Email Address",
				htmlContent: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
						<h2 style="color: #333; text-align: center;">Welcome to SpotQ!</h2>
						<p style="font-size: 16px; color: #555;">Thank you for registering. Please use the verification code below to verify your email address:</p>
						<div style="background-color: #f4f6f8; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
							<span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">${otp}</span>
						</div>
						<p style="font-size: 14px; color: #777;">This code is valid for <strong>5 minutes</strong> and can only be used once.</p>
						<p style="font-size: 14px; color: #777;">If you did not request this verification code, please ignore this email.</p>
					</div>
				`,
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
