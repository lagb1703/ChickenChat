import { FileDb } from "../types";
import HttpException from "@/backend/utils/error";
import MongoClient from "@/backend/utils/mongoClient";
import StorageService from "./storageService";
import { UserToken } from "@/backend/userModule/interfaces/user";
import Crypto from "crypto";
import { NextResponse } from "next/server";
import { Collections } from "../emuns";
import { ObjectId } from "mongodb";

export default class FileService {
    private static instance: FileService | null = null;

    public static getInstance(): FileService {
        if (FileService.instance === null) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }

    private mongoClient: MongoClient;

    private storageService: StorageService;

    private constructor() {
        this.mongoClient = MongoClient.getInstance();
        this.storageService = StorageService.getInstance();
    }

    async getFileInfo(id: string | number, userId?: string | number): Promise<FileDb> {
        const filters = [{ $match: { _id: new ObjectId(id.toString()) } }];
        const file = await this.mongoClient.aggregate<FileDb>(Collections.files, filters)
        console.log(file);
        if (!file) {
            throw new HttpException(`File with id ${id} not found`, 404);
        }
        return file[0];
    }

    private async saveFileInfo(fileDb: FileDb, user: UserToken): Promise<string> {
        fileDb.userId = user.userId;
        return (await this.mongoClient.insert(Collections.files, fileDb)).toString();
    }

    private async deleteFileInfo(id: string): Promise<void> {
        await this.mongoClient.delete(Collections.files, { id });
    }

    public async saveFile(file: File, user: UserToken): Promise<string> {
        // obtain ArrayBuffer/Uint8Array from File (support arrayBuffer() or bytes())
        const arrayBuffer = (file as any).arrayBuffer ? await (file as any).arrayBuffer() : await (file as any).bytes();
        const buffer = Buffer.from(arrayBuffer);
        const md5 = Crypto.createHash("md5").update(buffer).digest("hex");
        const fileDb: FileDb = {
            name: file.name,
            md5,
            bucket: "default",
        }
        await this.storageService.upload(buffer, file.name, "default", file.type);
        return await this.saveFileInfo(fileDb, user);
    }

    public async getFile(id: string, user: UserToken): Promise<Response> {
        const fileInfo = await this.getFileInfo(id, user.userId);
        if (fileInfo.userId !== user.userId) {
            throw new HttpException(`Unauthorized to access file with id ${id}`, 403);
        }
        const buffer = await this.storageService.download(fileInfo.name, fileInfo.bucket);
        const fileStream = buffer.createReadStream();
        const [metadata] = await buffer.getMetadata();
        const contentType = metadata.contentType || 'application/octet-stream';
        const headers = new Headers({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileInfo.name)}"`,
        });
        return new NextResponse(fileStream as any, { status: 200, headers });
    }

    public async deleteFile(id: string, user: UserToken): Promise<void> {
        const fileInfo = await this.getFileInfo(id, user.userId);
        if (fileInfo.userId !== user.userId) {
            throw new HttpException(`Unauthorized to delete file with id ${id}`, 403);
        }
        await this.storageService.delete(fileInfo.name, fileInfo.bucket);
        await this.deleteFileInfo(id);
    }

    public async getSignedUrl(id: string, expiresInSeconds: number = 60 * 60): Promise<string> {
        const fileInfo = await this.getFileInfo(id);
        return this.storageService.getSignedUrl(fileInfo.name, "default", expiresInSeconds);
    }
}