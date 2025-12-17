import { ExceptionsEnum } from "../emuns";
import HttpException from "@/backend/utils/error";
import StorageWapper from "../storageWapper";

export default class StorageService {
	private static instance: StorageService | null = null;
	private storage: StorageWapper;

	public static getInstance(): StorageService {
		if (StorageService.instance === null) {
			StorageService.instance = new StorageService();
		}
		return StorageService.instance;
	}

	private constructor() {
		this.storage = new StorageWapper();
	}

	public async upload(data: Buffer | string, name: string, folder: string, content_type?: string): Promise<void> {
		await this.storage.upload(data, `${folder}/${name}`, content_type);
	}

	public async download(name: string, folder: string) {
		try {
			return await this.storage.download(`${folder}/${name}`);
		} catch (err) {
			throw new HttpException(
				ExceptionsEnum.FILE_NOT_FOUND.replace(":file", `${folder}/${name}`),
				404,
			);
		}
	}

	public async delete(name: string, folder: string): Promise<void> {
		await this.storage.delete(`${folder}/${name}`);
	}

	public async getSignedUrl(name: string, folder: string, expiresInSeconds: number = 60 * 60): Promise<string> {
		return this.storage.getSignedUrl(`${folder}/${name}`, expiresInSeconds);
	}
}
