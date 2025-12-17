import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import Enviroment from "./enviroment";
import { EnviromentsVariablesEnum as Configuration } from './enums';

const e = Enviroment.getInstance();

const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.9,
    maxTokens: 8000,
    // timeout: 120,
});

const agent = createAgent({
    model,
    tools: [],
    systemPrompt: "eres un agente que ayuda a las personas",
});

export default agent;