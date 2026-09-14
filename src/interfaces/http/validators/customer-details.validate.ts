import { z } from "zod";

export const getCustomerDetailsSchema = z.object({
	id: z.string().uuid({ message: "Invalid customer ID format." }),
});
