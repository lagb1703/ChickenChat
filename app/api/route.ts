/**
 * @swagger
 * /api:
 *   get:
 *     description: Returns the hello world
 *     responses:
 *       200:
 *         description: Hello World!
 */
import { withErrorHandling } from '../../backend/utils/error';

export const GET = withErrorHandling(async (_request: Request) => {
    // Do whatever you want
    return new Response('Hello World!', {
        status: 200,
    });
});