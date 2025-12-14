import { UserLoginSchema } from '@/backend/authModule/types';
import { withErrorHandling } from '@/backend/utils/error';
import AuthService from '@/backend/authModule/authService';
const authService = AuthService.getInstance();  
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login a user
 *     description: Returns login token
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
    });
});