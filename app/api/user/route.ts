import UserService from '@/backend/userModule/userService';
import { jwt } from '@/backend/authModule/wapper';
import { UserToken } from '@/backend/userModule/interfaces/user';

const userService = UserService.getInstance();

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags:
 *       - user
 *     description: Returns the authenticated user's information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *                 isAdmin:
 *                   type: boolean
 */
export const GET = jwt(async (_request: Request) => {
    const userToken = (_request as any).user as UserToken;
    const user = await userService.getUserById(userToken.userId);
    return new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
});