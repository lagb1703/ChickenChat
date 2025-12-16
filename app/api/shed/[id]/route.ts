import ShedService from "@/backend/shedModule/services/shedService";
import { ShedSchema } from "@/backend/shedModule/types";
import { jwt } from "@/backend/authModule/wapper";
import { NextRequest } from "next/server";
import {HttpException} from "@/backend/utils/error";

const shedService = ShedService.getInstance();

type Params = Promise<{ id: string }>

/**
 * @swagger
 * /api/shed/{id}:
 *   patch:
 *     summary: Update an existing shed for the authenticated user
 *     tags:
 *       - Shed
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *        204:
 *          description: Shed updated successfully
 *        400:
 *          description: Bad Request
 */
export const PATCH = jwt(async (request: NextRequest, props: { params: Params }) => {
    const user = (request as any).user;
    const shed = ShedSchema.parse(await request.json());
    const id = (await props.params)?.id;
    if (!id) throw new HttpException("Shed id is required", 400);
    await shedService.updateShed(id, shed);
    return new Response(null, { status: 204 });
});