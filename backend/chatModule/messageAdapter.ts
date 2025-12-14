import { BaseMessage } from "langchain";
import MongoClient from "../utils/mongoClient";
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
        const filters = {
            userId: userId,
            chatId: chatId
        };
        const projections = {
            sort: { timestamp: -1 },
            limit: limit,
            skip: offset
        };
        // const documents = await this.client.query('messages', filters, projections);
        return [];
    }

    async findMessageByVector(text: string): Promise<BaseMessage | null> {
        // Implementación de búsqueda por vector utilizando MongoDB
        return null;
    }
}