import { BaseMessage } from "langchain";
import MongoClient from "../utils/mongoClient";
import { Collections } from "./enums";
import {embeddings} from "../utils/agent";
export interface MessageAdapter {
    getMessages(userId: string | number, chatId: string, limit?: number, offset?: number): Promise<BaseMessage[]>;
    findMessageByVector(text: string): Promise<BaseMessage[]>;
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
            { $sort: { createdAt: 1 } },
            { $project: { embedding: 0 } }
        ]
        const documents = await this.client.aggregate<BaseMessage>(Collections.messages, filters);
        return documents.map(doc => {
            const additional_kwargs_keys = Object.entries(doc.additional_kwargs);
            if(additional_kwargs_keys.length > 0)
                doc.content += `[${additional_kwargs_keys.join(", ")}]`;
            return doc
        });
    }

    async findMessageByVector(text: string): Promise<BaseMessage[]> {
        console.log("Finding messages by vector for text:", text);
        
        // Separamos los datos
        const splitText = text.split(";");
        const embedingText = splitText[0];
        const chatId = splitText[1]?.trim();
        const userId = splitText[2]?.trim();
        const vectorPregunta = await embeddings.embedQuery(embedingText);

        // 3. Pipeline de Agregación
        const pipeline = [
            {
                "$vectorSearch": {
                    "index": "search_vector_index",
                    "path": "embedding",
                    "queryVector": vectorPregunta,
                    "numCandidates": 20, // Aumenta esto un poco para dar margen
                    "limit": 2,
                    "filter": {
                        "chatId": chatId,
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "content": 1,
                    "chatId": 1, // Útil verlos para debuggear
                    "userId": 1,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ];

        console.log("Pipeline Filter:", pipeline); // Para debug

        const documents = await this.client.aggregate<BaseMessage>(Collections.messages, pipeline);
        const result = documents.map(doc => {
            const additional_kwargs_keys = Object.entries(doc.additional_kwargs);
            if(additional_kwargs_keys.length > 0)
                doc.content += `{${additional_kwargs_keys.join(", ")}}`;
            return doc
        });
        
        console.log("Vector search results:", result);
        return result;
    }
}