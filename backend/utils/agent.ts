import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool, Tool } from "@langchain/core/tools";
import FileService from "../fileModule/services/fileService";
import OpenAI from "openai";

const openai = new OpenAI();

async function isAValidObjectId(id: string) {
  const objectIdPattern = /^[a-f\d]{24}$/i;
  if(objectIdPattern.test(id)){
    return "El ID de la imagen es un ObjectId válido de MongoDB.";
  }
  return "El ID de la imagen no es un ObjectId válido de MongoDB.";
}

async function getImage(input: string) {
  console.log("Getting image for ID:", input);
  if (!input) {
    return "No image ID provided.";
  }
  const imageId = input.split(";")[0];
  const question = input.split(";").slice(1).join(" ");
  const objectIdPattern = /^[a-f\d]{24}$/i;
  if (!objectIdPattern.test(imageId)) {
    return "El ID de la imagen no es un ObjectId válido de MongoDB, intenta responder con tu respuesta anterior.";
  }
  const fileService = FileService.getInstance();
  const url = await fileService.getSignedUrl(imageId, 120);
  console.log("Generated signed URL:", url);
  const prompt = question
    ? `Describe la siguiente imagen en relación a la pregunta: ${question}`
    : "Describe brevemente el contenido de la siguiente imagen.";
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // <--- EL MODELO MÁS BARATO CON VISIÓN
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
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
  console.log("OpenAI response:", response.choices[0].message.content);
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
        `
          Úsalo para obtener la descripción de una imagen almacenada, este utiliza otro modelo de fondo. 
          El input es el ID de la imagen y una posible pregunta que puedas tener, encontraras el id de la imagen de la siguiente manera:
          [FileId: <ID_DE_LA_IMAGEN>]
          Si no tienes ninguna pregunta, solo envía el ID de la imagen.
          Si tienes una pregunta, sepárala del ID de la imagen con un punto y coma (;).
        `,
      func: getImage,
    }),
    new DynamicTool({
      name: "isAValidObjectId",
      description: "Verifica si un ID es un ObjectId válido de MongoDB. El input es el ID a verificar.",
      func: isAValidObjectId,
    }),
  ],
  systemPrompt: "eres un agente que ayuda a las personas, puedes ver imágenes y describirlas brevemente. Recuerda, eres un agente, tienes memoria de parte de la conversación.",
});

export default agent;
