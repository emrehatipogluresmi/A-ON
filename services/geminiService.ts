
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY bulunamadı. Lütfen Vercel ayarlarından API_KEY değişkenini tanımlayın.");
  }
  return new GoogleGenAI({ apiKey });
};

export const streamChatResponse = async function* (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) {
  try {
    const ai = getAIClient();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "Sen AION'sun. Aion Ekosistemi'nin kalbi ve zekasısın. Konuşma tarzın doğal, samimi ama profesyonel olmalı. Yanıtlarını Türkçe ver.",
      }
    });

    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const responseChunk = chunk as GenerateContentResponse;
      yield responseChunk.text || "";
    }
  } catch (error: any) {
    console.error("AION Chat Stream Error:", error);
    if (error.message?.includes("401") || error.message?.includes("key")) {
      yield "Hata: Geçersiz veya eksik API anahtarı. Lütfen yönetici ile iletişime geçin.";
    } else {
      yield `Bağlantı hatası: ${error.message || "Bilinmeyen bir sorun oluştu."}`;
    }
  }
};

export const generateOrEditImage = async (prompt: string, base64Image?: string): Promise<{ imageUrl: string; text?: string }> => {
  try {
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

    if (!imageUrl) throw new Error("Görsel verisi alınamadı.");

    return { imageUrl, text };
  } catch (error: any) {
    console.error("AION Vision Error:", error);
    throw error;
  }
};
