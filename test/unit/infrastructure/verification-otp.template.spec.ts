import { renderVerificationOtpTemplate } from "@infrastructure/templates/email/verification-otp.template.ts";

describe("VerificationOtpTemplate", () => {
	it("should render template with given OTP and default validity", () => {
		const rendered = renderVerificationOtpTemplate({ otp: "123456" });

		expect(rendered.subject).toBe("SpotQ - Verify Your Email Address");
		expect(rendered.htmlContent).toContain("123456");
		expect(rendered.htmlContent).toContain("5 minutes");
		expect(rendered.htmlContent).toContain("Experience the new way of dining!");
	});

	it("should render template with custom validity duration", () => {
		const rendered = renderVerificationOtpTemplate({
			otp: "987654",
			validityMinutes: 10,
		});

		expect(rendered.htmlContent).toContain("987654");
		expect(rendered.htmlContent).toContain("10 minutes");
	});
});
