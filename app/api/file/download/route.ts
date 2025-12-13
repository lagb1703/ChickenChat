import { jwt } from "@/backend/authModule/wapper";
import FileService from "@/backend/fileModule/services/fileService";
import { NextRequest, NextResponse } from "next/server";

const fileService = FileService.getInstance();

/**
 * @swagger
 * /api/file/download:
 *   get:
 *     summary: Download a file by its ID
 *     tags:
 *       - File
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad Request - Missing or invalid file ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Not Found - File does not exist
 *       500:
 *         description: Internal Server Error
 */
export const GET = jwt(async (req: NextRequest | Request) => {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");
    if (!fileId) {
        return NextResponse.json({ error: "File id is required" }, { status: 400 });
    }
    try {
        const user = (req as any).user;
        const response = await fileService.getFile(fileId, user);
        return response;
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: err.status || 500 });
    }
});