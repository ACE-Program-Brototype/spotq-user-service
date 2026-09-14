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
	GetCustomerProfileUseCase: Symbol.for("GetCustomerProfileUseCase"),
	UpdateCustomerProfileUseCase: Symbol.for("UpdateCustomerProfileUseCase"),
	ListCustomersUseCase: Symbol.for("ListCustomersUseCase"),

	// Forgot/Reset Password Use Cases
	CustomerForgotPasswordUseCase: Symbol.for("CustomerForgotPasswordUseCase"),
	CustomerVerifyForgotPasswordUseCase: Symbol.for(
		"CustomerVerifyForgotPasswordUseCase",
	),
	CustomerResetPasswordUseCase: Symbol.for("CustomerResetPasswordUseCase"),

	// Presentation
	UserAuthController: Symbol.for("UserAuthController"),
	CustomerProfileController: Symbol.for("CustomerProfileController"),
	CustomerAdminController: Symbol.for("CustomerAdminController"),
	UserRouter: Symbol.for("UserRouter"),
};
