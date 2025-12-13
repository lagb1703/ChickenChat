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

/**
 * @swagger
 * /api/auth:
 *   post:
 *     tags:
 *       - auth
 *     description: Returns the hello world
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hello World!
 */
export const POST = withErrorHandling(async (request: Request) => {
    const user = UserLoginSchema.parse(await request.json());
    const { email, password } = user;
    const token = await authService.login(email, password);
    return new Response(token, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
});