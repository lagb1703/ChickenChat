import ShedService from "@/backend/shedModule/services/shedService";
import { ShedSchema } from "@/backend/shedModule/types";
import { jwt } from "@/backend/authModule/wapper";

const shedService = ShedService.getInstance();

/**
 * @swagger
 * /api/shed:
 *   get:
 *     summary: Retrieve all sheds for the authenticated user
 *     tags:
 *       - Shed
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of sheds
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chatId:
 *                     type: string
 *                     nullable: true
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                     nullable: true
 *                   chickenNumber:
 *                     type: integer
 *                 required:
 *                   - name
 *                   - chickenNumber
 */
export const GET = jwt(async (request: Request) => {
    const user = (request as any).user;
    const sheds = await shedService.getAllShedByUserId(user.id);
    return new Response(JSON.stringify(sheds), { status: 200 });
});

/**
 * @swagger
 * /api/shed:
 *   post:
 *     summary: Create a new shed for the authenticated user
 *     tags:
 *       - Shed
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 nullable: true
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               chickenNumber:
 *                 type: integer
 *           required:
 *             - name
 *             - chickenNumber
 */
export const POST = jwt(async (request: Request) => {
    const shed = ShedSchema.parse(await request.json());
    const shedId = await shedService.saveShed(shed);
    return new Response(JSON.stringify({ shedId }), { status: 201 });
});