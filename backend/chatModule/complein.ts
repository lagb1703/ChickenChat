import { ReactAgent, BaseMessage, HumanMessage } from "langchain";
import { FrontMessage } from "./types";
import agent from "../utils/agent";
import FileService from "../fileModule/services/fileService";

export interface LLmComplein{
    agent: ReactAgent;
    getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<string>>;
}

export class OnltTextLlmComplein implements LLmComplein {
    agent: ReactAgent;

    constructor() {
        this.agent = agent;
    }

    async getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<string>> {
        const messagesPront = [...messages, new HumanMessage(lastMessage.messageText)];
        const stream = new ReadableStream({
        async start(controller) {
            // Usamos TextEncoder para convertir el texto a bytes (Uint8Array)
            const encoder = new TextEncoder();

            try {
            // 3. Iterar sobre el stream del agente de LangChain
            for await (const chunk of await agent.stream(
                { messages: messagesPront },
                { streamMode: "messages" } 
            )) {
                const [step, content] = Object.entries(chunk)[0];
                const text = content.content;

                if (text) {
                    controller.enqueue(encoder.encode(text));
                }
            }
            controller.close();
            } catch (error) {
            console.error("Error during agent streaming:", error);
            controller.error(error);
            }
        }
        });
        return stream;
    }
}

export class ImageAndTextLLmComplein implements LLmComplein {
    agent: ReactAgent;
    private fileService: FileService;

    constructor() {
        this.agent = agent;
        this.fileService = FileService.getInstance();
    }

    async getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<string>> {
        return "" as unknown as ReadableStream<any>; // Implementación pendiente
    }
}

export class ComplainCreator{
    async createComplein(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<string>>{
        let complenin: LLmComplein;
        if(lastMessage.image){
            complenin = new ImageAndTextLLmComplein();
        } else {
            complenin = new OnltTextLlmComplein();
        }
        return complenin.getResponse(messages, lastMessage);
    }
}