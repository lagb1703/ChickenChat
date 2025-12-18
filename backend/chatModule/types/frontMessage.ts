import * as z from "zod";

export const FrontMessageSchema = z.object({
    messageText: z.string(),
    fileId: z.string().optional().nullable(),
});

export type FrontMessage = z.infer<typeof FrontMessageSchema>;