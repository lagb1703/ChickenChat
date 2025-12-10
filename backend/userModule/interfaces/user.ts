import * as z from 'zod';

export const UserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    isAdmin: z.boolean().default(false).optional().nullable()
});

export type User = z.infer<typeof UserSchema>;

export interface UserToken {
    userId: string;
    isAdmin: boolean;
    email: string;
}