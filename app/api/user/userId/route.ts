import { admin } from "@/backend/authModule/wapper";
import UserService from "@/backend/userModule/userService";
import { NextRequest } from "next/server";

const userService = UserService.getInstance();


/**
 * @swagger
 * /api/user/userId:
 *   get:
 *     tags:
 *       - user
 *     summary: obtener usuario por ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: id del usuario
 *     responses:
 *       '200':
 *         description: Usuario encontrado
 *       '400':
 *         description: parametro de ID de usuario faltante
 *       '401':
 *         description: No autorizado
 *       '404':
 *         description: Usuario no encontrado
 */
export const GET = admin(async (req: Request | NextRequest) => {
    const searchParams = (req as NextRequest).nextUrl.searchParams;
    const id = searchParams.get("userId");
    if (!id) {
        return new Response(JSON.stringify({ message: "User ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    const userId = parseInt(id, 10);
    const user = await userService.getUserById(userId);
    if (!user) {
        return new Response(JSON.stringify({ message: "User not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});