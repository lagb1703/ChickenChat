import { UserToken } from "@/backend/userModule/interfaces/user";
import { ComplainCreator } from "../complein";
import { MessageAdapter, MongoMessageAdapter } from "../messageAdapter";
import MongoClient from "@/backend/utils/mongoClient";
import { BaseMessage } from "langchain";

export class ChatService {
    private messageAdapter: MessageAdapter;
    private complainCreator: ComplainCreator;
    private mongoClient: MongoClient;

    constructor() {
        this.messageAdapter = new MongoMessageAdapter();
        this.complainCreator = new ComplainCreator();
        this.mongoClient = MongoClient.getInstance();
    }

    private async saveMessage(userId: string | number, chatId: string, message: BaseMessage): Promise<void> {}

    async getMessages(chatId: string, offset: number, user: UserToken): Promise<BaseMessage[]>{
        return this.messageAdapter.getMessages(user.userId, chatId, offset);
    }

    async newMessage(chatId: string, messageText: string, user: UserToken, imageFile?: File): Promise<string> {
        return "";
    }
}