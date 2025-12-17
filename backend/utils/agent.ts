import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import Enviroment from "./enviroment";
import { EnviromentsVariablesEnum as Configuration } from './enums';

const e = Enviroment.getInstance();

const model = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.9,
    maxTokens: 8000,
    // timeout: 120,
});

const agent = createAgent({
    model,
    tools: [],
    systemPrompt: "You are a helpful assistant that translates English to French.",
});

export default agent;