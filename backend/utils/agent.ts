import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool, Tool } from "@langchain/core/tools";
import FileService from "../fileModule/services/fileService";
import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import ChatService from "../chatModule/service/chatService";

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const openai = new OpenAI();

async function getMessage(input: string) {
  const chatService = ChatService.getInstance();
  const messages = await chatService.findByVector(input);
  return `[Mensajes relevantes encontrados:\n${messages
    .map((msg, index) => `${index + 1}. ${msg.content}`)
    .join("\n")}]\n`;
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
    return "[El ID de la imagen no es un ObjectId válido de MongoDB.]\n";
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
  return `[${response.choices[0].message.content}]\n`;
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
      name: "GetMessages",
      description: `
          Úsalo para buscar mensajes relevantes en la base de datos según el contenido del mensaje del usuario.
          También, puedes obtener los id de las imagenes que el usuario ha enviado en el chat.
          Si vas a buscar una imagen, puedes utilizar FileId y una descripción corta.
          El input se compone de 3 cosas, separadas por punto y coma (;):
          1. El texto que necesites recordar.
          2. (Opcional) El ID del chat para filtrar los mensajes.
          3. (Opcional) El ID del usuario para filtrar los mensajes.
          <pregunta>;<chatId>;<userId>
          Ejemplo de input con chatId y userId: "¿Cuál es el estado de mi pedido?;69423ac2e825d36b16193603;6"
          recuerda que chatId es un objectId de MongoDB y userId es un numero.
        `,
      func: getMessage,
    }),
    new DynamicTool({
      name: "GetImage",
      description: `
          Úsalo para obtener la descripción de una imagen almacenada, este utiliza otro modelo de fondo. 
          Si no tienes el ID de la imagen, puedes intentar buscar mensajes relevantes con el otro tool.
          El id de la imagen no puede ser null o none o vacío.
          El input es el ID de la imagen y una posible pregunta que puedas tener, encontraras el id de la imagen de la siguiente manera:
          [FileId: <ID_DE_LA_IMAGEN>]
          Si no tienes ninguna pregunta, solo envía el ID de la imagen.
          Si tienes una pregunta, sepárala del ID de la imagen con un punto y coma (;).
        `,
      func: getImage,
    }),
  ],
  systemPrompt:
    "eres un agente que ayuda a las personas, puedes ver imágenes y describirlas brevemente. Recuerda, eres un agente, tienes memoria de parte de la conversación.",
});

export default agent;
