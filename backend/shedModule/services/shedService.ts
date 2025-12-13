import { ShedType } from "../types";
import MongoClient from "@/backend/utils/mongoClient";

export default class ShedService {
    private static instance: ShedService;
    private mongoClient: MongoClient;
    
    public static getInstance(): ShedService {
        if (!ShedService.instance) {
            ShedService.instance = new ShedService();
        }
        return ShedService.instance;
    }
    private constructor() {
        this.mongoClient = MongoClient.getInstance();
    }

    public async getAllShedByUserId(userId: string): Promise<ShedType[]> {
        return await this.mongoClient.aggregate<ShedType>("", []);
    }

    public async saveShed(shed: ShedType): Promise<string> {
        return (await this.mongoClient.insert("", shed)).toString();
    }

    public async updateShed(shedId: string, shed: Partial<ShedType>): Promise<void> {
        await this.mongoClient.update("", { _id: shedId }, { $set: shed });
    }

    public async deleteShed(shedId: string): Promise<void> {
        await this.mongoClient.delete("", { id: shedId });
    }
}