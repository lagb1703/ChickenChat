import ChatService from "@/backend/chatModule/service/chatService";
import { FrontMessage, FrontMessageSchema } from "@/backend/chatModule/types";
import { jwt } from "@/backend/authModule/wapper";
import { NextRequest } from "next/server";
import {HttpException} from "@/backend/utils/error";
import { NextResponse } from "next/server";

const chatService = ChatService.getInstance();

type Params = Promise<{ id: string }>

/**
 * @swagger
 * /api/shed/{id}/messages:
 *   get:
 *     summary: Retrieve messages for a specific shed (chat)
 *     tags:
 *       - Shed
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   type:
 *                     type: string
 *                   content:
 *                     type: object
 *                   response_metadata:
 *                     type: object
 *                   tool_calls:
 *                     type: array
 *                     items:
 *                       type: object
 *                   tool_call_id:
 *                     type: string
 *                   chatId:
 *                     type: string
 */
export const GET = jwt(async (request: NextRequest, props: { params: Params }) => {
    const user = (request as any).user;
    const id = (await props.params)?.id;
    if (!id) throw new HttpException("Shed id is required", 400);
    const search = request.nextUrl.searchParams;
    const offset = parseInt(search.get("offset") || "0", 10);
    const messages =  await chatService.getMessages(id, offset, user);
    return new Response(JSON.stringify(messages), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

/**
 * @swagger
 * /api/shed/{id}/messages:
 *   post:
 *     summary: Add a new message to a specific shed (chat)
 *     tags:
 *       - Shed
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               messageText:
 *                 type: string
 *               fileId:
 *                 type: string
 *             required:
 *               - messageText
 *     responses:
 *       '201':
 *         description: Message created successfully
 */
export const POST = jwt(async (request: NextRequest, props: { params: Params }) => {
    const user = (request as any).user;
    const id = (await props.params)?.id;
    if (!id) throw new HttpException("Shed id is required", 400);
    const formData = await request.formData();
    const messageText = formData.get("messageText");
    const fileId = formData.get("fileId") as string | null;
    const frontMessage = FrontMessageSchema.parse({ messageText: messageText, fileId: (fileId != "")? fileId : null });
    const stream = await chatService.newMessage(id, frontMessage, user);
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
});