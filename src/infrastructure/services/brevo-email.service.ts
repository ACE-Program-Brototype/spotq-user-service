import type { IEmailService } from "@application/ports/services/email-service.interface.ts";
import type { ILogger } from "@application/ports/services/logger.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { config } from "@config/env.ts";
import { BrevoClient } from "@getbrevo/brevo";
import { renderVerificationOtpTemplate } from "@infrastructure/templates/email/index.ts";
import { inject, injectable } from "inversify";

@injectable()
export class BrevoEmailService implements IEmailService {
	private readonly _client: BrevoClient;

	constructor(
		@inject(TYPES.Logger)
		private readonly _logger: ILogger,
	) {
		this._client = new BrevoClient({
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
				validityMinutes: Math.floor(config.otp.ttlSeconds / 60),
			});

			await this._client.transactionalEmails.sendTransacEmail({
				sender: {
					name: config.brevo.senderName,
					email: config.brevo.senderEmail,
				},
				to: [{ email: toEmail }],
				subject,
				htmlContent,
			});

			this._logger.info(
				{ toEmail, event: "EMAIL_VERIFICATION_SENT" },
				"Verification email sent successfully via Brevo",
			);
		} catch (error) {
			this._logger.error(
				{ err: error, toEmail, event: "EMAIL_DELIVERY_FAILED" },
				"Failed to deliver verification email via Brevo",
			);
			throw error;
		}
	}
}
