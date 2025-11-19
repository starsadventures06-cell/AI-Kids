import { GoogleGenAI, Type, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";
import { runWithRetry } from './utils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface HealthResult {
    answer: string;
    imageUrl: string;
}

export async function askHealthAdviser(question: string, lang: string): Promise<HealthResult> {
    // 1. Generate Structured Text Answer and 3D Image Prompt
    const prompt = `
    You are a highly knowledgeable, friendly, and professional AI Health Adviser.
    
    User Question: "${question}"
    Language: ${lang}
    
    Your task:
    1. Provide a comprehensive, accurate, and well-organized answer about nutrition, health, sports, or diseases.
    2. Use formatting like bullet points, numbered lists, or short paragraphs to make it very easy to understand.
    3. Create a prompt for an image generation model to create a "high-quality 3D render" that visually explains the concept or anatomy discussed.
    
    The image prompt MUST specifically ask for a "hyper-realistic 3D render", "medical visualization", or "scientific 3D illustration" style.
    `;

    const textResponse = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: { 
                        type: Type.STRING,
                        description: "The well-organized text answer to the user's health question."
                    },
                    imagePrompt: { 
                        type: Type.STRING,
                        description: "The prompt for the image generator, specifically requesting a 3D render style."
                    }
                },
                required: ['answer', 'imagePrompt']
            }
        }
    }));

    const data = JSON.parse(textResponse.text || '{}');
    const answerText = data.answer;
    const imgPrompt = data.imagePrompt;

    // 2. Generate the 3D Image using Imagen
    const imageResponse = await runWithRetry<GenerateImagesResponse>(() => ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imgPrompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '4:3',
            outputMimeType: 'image/jpeg'
        }
    }));

    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return {
        answer: answerText,
        imageUrl: imageUrl
    };
}