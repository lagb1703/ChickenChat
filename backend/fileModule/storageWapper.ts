import { Storage, File } from "@google-cloud/storage";
import Enviroment from "@/backend/utils/enviroment";
import { EnviromentsVariablesEnum as Configuration } from "@/backend/utils/enums";

export default class StorageWapper {
	private client: Storage;
	private bucket: ReturnType<Storage["bucket"]>;

	constructor() {
		const e = Enviroment.getInstance();
		const credentialsUrl = e.get(Configuration.GOOGLE_APPLICATION_CREDENTIALS);
		const bucketName = e.get(Configuration.GOOGLE_BUCKET_NAME);
		this.client = new Storage({ keyFilename: credentialsUrl });
		this.bucket = this.client.bucket(bucketName);
	}

	public async upload(data: Buffer | string, name: string, contentType?: string): Promise<void> {
		const file = this.bucket.file(name);
		const options: any = {};
		if (contentType) options.contentType = contentType;
		await file.save(data, options);
	}

	public async download(name: string): Promise<File> {
		const file = this.bucket.file(name);
		return file;
	}

	public async delete(name: string): Promise<void> {
		const file = this.bucket.file(name);
		await file.delete();
	}

	public async getSignedUrl(name: string, expiresInSeconds: number = 60 * 60): Promise<string> {
		const file = this.bucket.file(name);
		const [url] = await file.getSignedUrl({
			action: "read",
			expires: Date.now() + expiresInSeconds * 1000,
		});
		return url;
	}
}
