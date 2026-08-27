export const USER_TYPES = {
	// Repositories
	UserRepository: Symbol.for("UserRepository"),
	RefreshTokenRepository: Symbol.for("RefreshTokenRepository"),
	DeviceRepository: Symbol.for("DeviceRepository"),

	// Application Use Cases
	RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),
	VerifyEmailOtpUseCase: Symbol.for("VerifyEmailOtpUseCase"),
	ResendEmailOtpUseCase: Symbol.for("ResendEmailOtpUseCase"),
	LogoutUseCase: Symbol.for("LogoutUseCase"),
	GoogleAuthUseCase: Symbol.for("GoogleAuthUseCase"),
	LoginUseCase: Symbol.for("LoginUseCase"),
	RefreshTokenUseCase: Symbol.for("RefreshTokenUseCase"),

	// Presentation
	UserAuthController: Symbol.for("UserAuthController"),
	UserRouter: Symbol.for("UserRouter"),

	CustomerForgotPasswordUseCase: Symbol.for("CustomerForgotPasswordUseCase"),
	CustomerVerifyForgotPasswordUseCase: Symbol.for("CustomerVerifyForgotPasswordUseCase"),
	CustomerResetPasswordUseCase: Symbol.for("CustomerResetPasswordUseCase")
} as const;
