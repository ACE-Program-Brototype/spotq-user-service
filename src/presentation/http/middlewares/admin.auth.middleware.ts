import { verifyTempToken } from "@infrastructure/services/token";
import { HttpStatus, ResponseMessage } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { AppError } from "@shared/util/app.error";
import { NextFunction, Request, Response } from "express";


export const adminTempTokenCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tempToken } = req.cookies

        console.log("-----------tempToken------------" , tempToken)
        console.log("--------cookies--------", req.cookies)

        if (!tempToken) {
            throw new AppError(authConstants.MISSING_TOKEN, HttpStatus.BAD_REQUEST)
        }

        const decoded = verifyTempToken(tempToken) as {userId: string, role: string}

        if (decoded.role != "admin") {
            throw new AppError(authConstants.INVALID_USER, HttpStatus.UNAUTHORIZED)
        }

        (req as any).userId = decoded.userId

        next()

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new AppError(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
        throw new AppError(ResponseMessage.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}