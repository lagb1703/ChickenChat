import FileService from "@/backend/fileModule/services/fileService";
import { jwt } from "@/backend/authModule/wapper";

const fileService = FileService.getInstance();

/**
 * @swagger
 * /api/file:
 *   post:
 *     summary: Upload a file
 *     tags:
 *      - File
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *       multipart/form-data:
 *         schema:
 *           type: object
 *           properties:
 *             file:
 *              type: string
 *              format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
export const POST = jwt(async (request) => {
    const formData = await request.formData();
    const file: File = formData.get("file") as File;
    const user = (request as any).user;
    const fileId = await fileService.saveFile(file, user);
    return new Response(fileId, { status: 200 });
});