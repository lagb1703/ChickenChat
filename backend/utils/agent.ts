import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import FileService from "../fileModule/services/fileService";
import OpenAI from "openai";

const openai = new OpenAI();

async function getImage(imageId: string) {
  const fileService = FileService.getInstance();
  const url = await fileService.getSignedUrl(imageId, 120);
  console.log("Generated signed URL:", url);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // <--- EL MODELO MÁS BARATO CON VISIÓN
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "¿Qué hay en esta imagen? Sé breve.",
          },
          {
            type: "image_url",
            image_url: {
              url: url,
              detail: "low", // <--- EL TRUCO PARA PAGAR MENOS
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });
  console.log("OpenAI response:", response);
  return response.choices[0].message.content;
}

const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.9,
  maxTokens: 8000,
  // timeout: 120,
});

const agent = createAgent({
  model,
  tools: [
    new DynamicTool({
      name: "GetImage",
      description:
        "Úsalo para obtener la descripción de una imagen almacenada, este utiliza otro modelo de fondo. El input es el ID de la imagen, la encontraras de la siguiente manera: [Image: fileId].",
      func: getImage,
    }),
  ],
  systemPrompt: "eres un agente que ayuda a las personas",
});

export default agent;
