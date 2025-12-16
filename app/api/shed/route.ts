import ShedService from "@/backend/shedModule/services/shedService";
import { ShedSchema } from "@/backend/shedModule/types";
import { jwt } from "@/backend/authModule/wapper";
import { UserToken } from "@/backend/userModule/interfaces/user";

const shedService = ShedService.getInstance();

/**
 * @swagger
 * /api/shed:
 *   get:
 *     summary: Retrieve all sheds for the authenticated user
 *     tags:
 *       - Shed
 *     security:
 *       - BearerAuth: []
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
    const user:UserToken = (request as any).user;
    const sheds = await shedService.getAllShedByUserId(user.userId);
    return new Response(JSON.stringify(sheds), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

/**
 * @swagger
 * /api/shed:
 *   post:
 *     summary: Create a new shed for the authenticated user
 *     tags:
 *       - Shed
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       201:
 *         description: Shed created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
export const POST = jwt(async (request: Request) => {
    const shed = ShedSchema.parse(await request.json());
    const user = (request as any).user;
    const shedId = await shedService.saveShed(shed, user);
    return new Response(shedId, { status: 201 });
});