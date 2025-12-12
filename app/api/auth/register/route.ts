import UserService from '@/backend/userModule/userService';
import { withErrorHandling } from '@/backend/utils/error';
import { UserSchema } from '@/backend/userModule/interfaces/user';

const userService = UserService.getInstance();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - user
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 default: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               isAdmin:
 *                 type: boolean
 *                 nullable: true
 *                 default: false
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 */
export const POST = withErrorHandling(async (request: Request) => {
    const user = UserSchema.parse(await request.json());
    await userService.register(user);
    return new Response(null, {
        status: 201,
    });
});