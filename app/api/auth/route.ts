import { jwt } from '@/backend/authModule/wapper';
import AuthService from '@/backend/authModule/authService';
import { UserLoginSchema } from '@/backend/authModule/types';
import { withErrorHandling } from '@/backend/utils/error';

const authService = AuthService.getInstance();

/**
 * @swagger
 * /api/auth:
 *   get:
 *     tags:
 *       - auth
 *     description: Returns the hello world
 *     responses:
 *       200:
 *         description: Hello World!
 */
export const GET = jwt(async (_request: Request) => {
    // Do whatever you want
    return new Response('Hello World!', {
        status: 200,
    });
});