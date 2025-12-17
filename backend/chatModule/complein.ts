import { ReactAgent, BaseMessage, HumanMessage } from "langchain";
import { FrontMessage } from "./types";
import agent from "../utils/agent";
import FileService from "../fileModule/services/fileService";
import { ChatOpenAI } from "@langchain/openai";
import Enviroment from "../utils/enviroment";
import { EnviromentsVariablesEnum as Configuration } from '../utils/enums';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export interface LLmComplein{
    agent: ReactAgent;
    getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<any>>;
}

export class OnltTextLlmComplein implements LLmComplein {
    agent: ReactAgent;

    constructor() {
        this.agent = agent;
    }

    async getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<any>> {
        const messagesPront = [...messages, new HumanMessage(lastMessage.messageText)];
        // const response = await this.agent.invoke({
        //   messages: messagesPront,
        // });
        // const length = response.messages.length;
        // console.log(response.messages[length - 1].content);
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

                console.log("Chunk received from agent:", text);

                if (text) {
                    // 4. Encolar el fragmento en el Web Stream
                    controller.enqueue(encoder.encode(text));
                }
            }
            
            // 5. Cerrar el stream cuando el agente termine
            controller.close();
            } catch (error) {
            console.error("Error during agent streaming:", error);
            controller.error(error); // Notificar error al cliente
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

    async getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<any>> {
        return "" as unknown as ReadableStream<any>; // Implementación pendiente
    }
}

export class ComplainCreator{
    async createComplein(messages: BaseMessage[], lastMessage: FrontMessage): Promise<ReadableStream<any>>{
        let complenin: LLmComplein;
        if(lastMessage.image){
            complenin = new ImageAndTextLLmComplein();
        } else {
            complenin = new OnltTextLlmComplein();
        }
        return complenin.getResponse(messages, lastMessage);
    }
}