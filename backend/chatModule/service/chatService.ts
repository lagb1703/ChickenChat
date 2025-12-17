import { UserToken } from "@/backend/userModule/interfaces/user";
import { FrontMessage } from "../types";
import { ComplainCreator } from "../complein";
import { MessageAdapter, MongoMessageAdapter } from "../messageAdapter";
import MongoClient from "@/backend/utils/mongoClient";
import { BaseMessage } from "langchain";
import { Collections } from "@/backend/chatModule/enums";

export default class ChatService {
    private messageAdapter: MessageAdapter;
    private complainCreator: ComplainCreator;
    private mongoClient: MongoClient;

    private static instance: ChatService;

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    private constructor() {
        this.messageAdapter = new MongoMessageAdapter();
        this.complainCreator = new ComplainCreator();
        this.mongoClient = MongoClient.getInstance();
    }

    private async saveMessage(userId: string | number, chatId: string, message: BaseMessage): Promise<string> {
        const messageId = await this.mongoClient.insert(Collections.messages, {...message, userId});
        return messageId.toString();
    }

    async getMessages(chatId: string, offset: number, user: UserToken): Promise<BaseMessage[]>{
        return this.messageAdapter.getMessages(user.userId, chatId, offset);
    }

    async newMessage(chatId: string, frontMessage: FrontMessage, user: UserToken): Promise<ReadableStream<any>> {
        const messages = await this.getMessages(chatId, 0, user);
        console.log("Messages retrieved:", messages.length);
        console.log("esperando agente...");
        return await this.complainCreator.createComplein(messages, frontMessage);
    }
}