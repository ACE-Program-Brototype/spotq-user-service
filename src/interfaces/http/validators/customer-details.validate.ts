import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const getCustomerDetailsSchema = z.object({
	id: z
		.string()
		.uuid({ message: VALIDATION_MESSAGES.CUSTOMER.INVALID_ID_FORMAT }),
});
