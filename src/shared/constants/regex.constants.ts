export const REGEX = {
	EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
	NAME: /^[\p{L}\p{M}]+(?:[' -][\p{L}\p{M}]+)*$/u,
	INDIAN_PHONE: /^\+91[6-9]\d{9}$/,
	OTP: /^\d{6}$/,
	PASSWORD: {
		UPPERCASE: /[A-Z]/,
		LOWERCASE: /[a-z]/,
		NUMBER: /[0-9]/,
		SPECIAL: /[^A-Za-z0-9]/,
	},
};
