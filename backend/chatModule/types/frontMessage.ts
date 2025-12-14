import * as z from "zod";

export const FrontMessageSchema = z.object({
    messageText: z.string(),
    image: z.file().optional().nullable(),
});

export type FrontMessage = z.infer<typeof FrontMessageSchema>;