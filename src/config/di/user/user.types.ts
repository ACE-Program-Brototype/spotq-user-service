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

	// Presentation
	UserAuthController: Symbol.for("UserAuthController"),
	UserRouter: Symbol.for("UserRouter"),
} as const;
