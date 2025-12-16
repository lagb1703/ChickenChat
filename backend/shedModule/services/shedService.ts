import { ShedType } from "../types";
import MongoClient from "@/backend/utils/mongoClient";
import { Collections } from "../emuns";
import { UserToken } from "@/backend/userModule/interfaces/user";
import { ObjectId } from "mongodb";

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
        const pipeline = [
            { $match: { userId } },
            {
                $project: {
                    _id: 0,
                    "chatId": "$_id",
                    "name": {
                        $arrayElemAt: ["$sheds.name", -1]
                    },
                    "description": {
                        $arrayElemAt: ["$sheds.description", -1]
                    },
                    "chickenNumber": {
                        $arrayElemAt: ["$sheds.chickenNumber", -1]
                    },
                    date: 1,
                }
            }
        ];
        return await this.mongoClient.aggregate<ShedType>(Collections.CHATS, pipeline);
    }

    public async saveShed(shed: ShedType, user: UserToken): Promise<string> {
        const chat: Record<string, any> = {
            date: new Date(),
            userId: user.userId,
            sheds: [
                {
                    _id: new ObjectId(), // to be filled by the database
                    description: shed.description,
                    chickenNumber: shed.chickenNumber,
                    name: shed.name,
                    date: new Date()
                }
            ]
        };
        const objectId = await this.mongoClient.insert(Collections.CHATS, chat);
        return objectId.toString();
    }

    public async updateShed(shedId: string, shed: Partial<ShedType>): Promise<void> {
        const shedUpdate: Record<string, any> = {
            _id: new ObjectId(), 
            description: shed.description,
            chickenNumber: shed.chickenNumber,
            name: shed.name,
            date: new Date()
        }
        await this.mongoClient.update(
            Collections.CHATS, 
            { _id: new ObjectId(shedId) }, 
            { $push: { sheds: shedUpdate } });
    }

    public async deleteShed(shedId: string): Promise<void> {
        await this.mongoClient.delete(Collections.CHATS, { _id: new ObjectId(shedId) });
    }
}