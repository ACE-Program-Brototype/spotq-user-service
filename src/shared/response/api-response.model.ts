import { HttpStatus } from "@shared/constants";
import { Response } from "express";

export const successResponse = <T>(res : Response, data : T, message: string = "Success", statusCode: number = HttpStatus.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
