import { ReactAgent, BaseMessage } from "langchain";
import { FrontMessage } from "./types";
import agent from "../utils/agent";
import FileService from "../fileModule/services/fileService";

export interface LLmComplein{
    agent: ReactAgent;
    getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<string>;
}

export class OnltTextLlmComplein implements LLmComplein {
    agent: ReactAgent;

    constructor() {
        this.agent = agent;
    }

    async getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<string> {
        return ""
    }
}

export class ImageAndTextLLmComplein implements LLmComplein {
    agent: ReactAgent;
    private fileService: FileService;

    constructor() {
        this.agent = agent;
        this.fileService = FileService.getInstance();
    }

    async getResponse(messages: BaseMessage[], lastMessage: FrontMessage): Promise<string> {
        return "";
    }
}

export class ComplainCreator{
    async createComplein(messages: BaseMessage[], lastMessage: FrontMessage): Promise<string>{
        let complenin: LLmComplein;
        if(lastMessage.image){
            complenin = new ImageAndTextLLmComplein();
        } else {
            complenin = new OnltTextLlmComplein();
        }
        return complenin.getResponse(messages, lastMessage);
    }
}