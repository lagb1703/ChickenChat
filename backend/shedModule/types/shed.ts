import * as z from 'zod';

export const ShedSchema = z.object({
    chatId: z.string().optional().nullable(),
    name: z.string(),
    description: z.string().optional().nullable(),
    chickenNumber: z.number()
});

export type ShedType = z.infer<typeof ShedSchema>;