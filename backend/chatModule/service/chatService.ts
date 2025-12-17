import { UserToken } from "@/backend/userModule/interfaces/user";
import { FrontMessage } from "../types";
import { ComplainCreator } from "../complein";
import { MessageAdapter, MongoMessageAdapter } from "../messageAdapter";
import MongoClient from "@/backend/utils/mongoClient";
import { BaseMessage } from "langchain";
import { Collections } from "@/backend/chatModule/enums";
import { HumanMessage, AIMessage } from "langchain";

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
        const messageId = await this.mongoClient.insert(Collections.messages, {...message, userId, chatId, createdAt: new Date()});
        return messageId.toString();
    }

    async getMessages(chatId: string, offset: number, user: UserToken): Promise<BaseMessage[]>{
        return this.messageAdapter.getMessages(user.userId, chatId, 2, offset);
    }

    async newMessage(chatId: string, frontMessage: FrontMessage, user: UserToken): Promise<ReadableStream<any>> {
        const messages = await this.getMessages(chatId, 0, user);
        let response = "";
        const self = this;
        const ws = new WritableStream({
            write(chunk) {
                response += new TextDecoder().decode(chunk);
            },
            close() { 
                (async ()=>{
                    const humanMessage = frontMessage.image
                        ? new HumanMessage({ content: frontMessage.messageText, additional_kwargs: { image: frontMessage.image.name } })
                        : new HumanMessage(frontMessage.messageText);
                    await self.saveMessage(user.userId, chatId, humanMessage);
                    const aiMessage = new AIMessage(response);
                    await self.saveMessage(user.userId, chatId, aiMessage);
                })()
            },
            abort(err) { console.error('Abort', err); }
        });
        const stream = await this.complainCreator.createComplein(messages, frontMessage, user);
        const [streamForReturn, streamForLog] = stream.tee();
        streamForLog.pipeTo(ws).catch(err => console.error(err));
        return streamForReturn;
    }
}