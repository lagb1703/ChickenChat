import { BaseMessage } from "langchain";
import MongoClient from "../utils/mongoClient";
import { Collections } from "./enums";
export interface MessageAdapter {
    getMessages(userId: string | number, chatId: string, limit?: number, offset?: number): Promise<BaseMessage[]>;
    findMessageByVector(text: string): Promise<BaseMessage | null>;
}

export class MongoMessageAdapter implements MessageAdapter {
    private client: MongoClient;

    constructor() {
        this.client = MongoClient.getInstance();
    }

    async getMessages(userId: string | number, chatId: string, limit: number = 50, offset: number = 0): Promise<BaseMessage[]> {
        const filters = [
            {$match: { chatId: chatId, userId: userId } },
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: limit },
            { $sort: { createdAt: 1 } } 
        ]
        const documents = await this.client.aggregate<BaseMessage>(Collections.messages, filters);
        return documents;
    }

    async findMessageByVector(text: string): Promise<BaseMessage | null> {
        // Implementación de búsqueda por vector utilizando MongoDB
        return null;
    }
}