import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import Enviroment from "./enviroment";
import { EnviromentsVariablesEnum as Configuration } from './enums';

const e = Enviroment.getInstance();

const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.1,
    maxTokens: 1000,
    timeout: 30,
    openAIApiKey: e.get(Configuration.OPENAI_API_KEY)
});

const agent = createAgent({
    model,
    tools: []
});

export default agent;