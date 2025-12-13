import { jwt } from "@/backend/authModule/wapper";
import FileService from "@/backend/fileModule/services/fileService";
import { NextRequest, NextResponse } from "next/server";

const fileService = FileService.getInstance();

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