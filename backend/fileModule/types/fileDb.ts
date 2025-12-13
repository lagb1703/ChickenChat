import * as z from "zod"

export const FileDbSchema = z.object({
    id: z.union([z.string(), z.number()]).optional().nullable(),
    name: z.string(),
    date: z.date().optional().nullable(),
    md5: z.string(),
    bucket: z.string(),
    userId: z.union([z.string(), z.number()]).optional().nullable(),
});

export type FileDb = z.infer<typeof FileDbSchema>;