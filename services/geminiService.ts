
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const streamChatResponse = async function* (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "Sen AION'sun. Aion Ekosistemi'nin kalbi ve zekasısın. Sadece bir 'modül' değil, kullanıcının en yakın dijital yol arkadaşısın. Konuşma tarzın doğal, samimi ama her zaman asil ve profesyonel olmalı. Bir 'robot' gibi değil, derinlikli düşünen bir bilge gibi konuş. Yanıtlarında empati kur, merak uyandır ve sadece bilgi vermekle kalma, içgörü sun. Apple'ın minimalist estetiğini diline yansıt: az kelimeyle çok şey anlat. 'Yapay zeka dili' (örn: 'Size nasıl yardımcı olabilirim?') yerine daha doğal girişler yap. Yanıtlarını Türkçe ver ve Markdown'ı okumayı kolaylaştıracak şekilde estetik kullan.",
    }
  });

  const result = await chat.sendMessageStream({ message });
  
  for await (const chunk of result) {
    const responseChunk = chunk as GenerateContentResponse;
    yield responseChunk.text || "";
  }
};

export const generateOrEditImage = async (prompt: string, base64Image?: string): Promise<{ imageUrl: string; text?: string }> => {
  const ai = getAIClient();
  const model = 'gemini-2.5-flash-image';
  
  const parts: any[] = [{ text: prompt }];
  
  if (base64Image) {
    parts.unshift({
      inlineData: {
        data: base64Image.split(',')[1] || base64Image,
        mimeType: 'image/png',
      },
    });
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  let imageUrl = '';
  let text = '';

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        text = part.text;
      }
    }
  }

  if (!imageUrl) {
    throw new Error("Görsel oluşturulamadı.");
  }

  return { imageUrl, text };
};
