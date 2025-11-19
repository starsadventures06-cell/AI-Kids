import { GoogleGenAI, Type, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";
import { runWithRetry } from './utils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface StudyResult {
    answer: string;
    imageUrl: string;
}

export async function askStudyBuddy(question: string, subject: string, lang: string): Promise<StudyResult> {
    // 1. Generate Answer Text and Image Prompt
    // We use gemini-2.5-flash for speed and reasoning
    
    let imageStyleInstruction = "";
    if (subject === 'medicine') {
        imageStyleInstruction = "The image prompt MUST describe a 'high quality 3D render' of the anatomical or biological concept related to the question. It should be scientifically accurate but visually clear.";
    } else {
        imageStyleInstruction = "The image prompt MUST describe a 'clear, colorful educational illustration' explaining the concept. It should be suitable for a school textbook.";
    }

    const prompt = `
    You are a helpful, encouraging AI tutor for students. 
    Subject: ${subject}.
    Question: "${question}".
    Language: ${lang}.

    Please provide:
    1. A clear, concise, and accurate answer to the question suitable for a student.
    2. An image prompt that I can use to generate a visual explanation of the answer. 
    ${imageStyleInstruction}
    `;

    const textResponse = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING }
                },
                required: ['answer', 'imagePrompt']
            }
        }
    }));

    const data = JSON.parse(textResponse.text || '{}');
    const answerText = data.answer;
    const imgPrompt = data.imagePrompt;

    // 2. Generate the Image
    // We use imagen-4.0-generate-001 for high quality images, especially for 3D renders
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