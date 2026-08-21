
import { InvalidCredentialsError } from "@domain/errors/invalid.credentials.error";
import { InvalidOtpError } from "@domain/errors/invalid.otp.error";
import { OtpExpiredError } from "@domain/errors/otp.expired.error";
import { ResetPasswordFailedError } from "@domain/errors/reset.password.error";
import { UserNotFoundError } from "@domain/errors/user.not-found.error";
import { ResponseMessage } from "@shared/constants";
import { HttpStatus } from "@shared/constants/http.constants";
import { AppError } from "@shared/util/app.error";

export interface HttpErrorResult {
    statusCode: number;
    code: string;
    message: string;
}

export function mapErrorToHttp(error: unknown): HttpErrorResult {
    if (error instanceof InvalidOtpError) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            code: error.code,
            message: error.message,
        };
    }

    if (error instanceof OtpExpiredError) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            code: error.code,
            message: error.message,
        };
    }

    if (error instanceof InvalidCredentialsError) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            code: error.code,
            message: error.message,
        };
    }

    if (error instanceof UserNotFoundError) {
        return {
            statusCode: HttpStatus.NOT_FOUND,
            code: error.code,
            message: error.message,
        };
    }

    if (error instanceof ResetPasswordFailedError) {
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            code: error.code,
            message: error.message,
        };
    }

    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            code: error?.error ?? "HTTP_ERROR",
            message: error.message,
        };
    }

    return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ResponseMessage.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.UNEXPECTED_ERROR,
    };
}