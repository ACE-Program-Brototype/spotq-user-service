export interface GoogleUserPayload {
	sub: string;
	email: string;
	emailVerified: boolean;
	name: string;
	picture?: string | null;
}

export interface IGoogleAuthService {
	verifyIdToken(idToken: string): Promise<GoogleUserPayload>;
}
