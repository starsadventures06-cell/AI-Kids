import { GoogleGenAI, Modality, Type, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";
import type { StoryPart } from '../types';
import { decodeAudioData, runWithRetry } from './utils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

interface StoryGenerationResult {
    story: StoryPart[];
}

export async function generateStory(interests: string[], lang: string, setProgress: (progress: string) => void): Promise<StoryGenerationResult> {
    const interestsText = interests.join(', ');
    
    // Step 1: Generate story text and image prompts
    setProgress('generatingStory');
    const storyPrompt = `Create a short, magical, and positive story for a young child (around 5-7 years old) based on these interests: ${interestsText}. The story should be in ${lang}. Divide the story into exactly 5 paragraphs. Each paragraph should be a distinct part of the story.`;
    
    const storyResponse = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: storyPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    storyParts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                paragraph: {
                                    type: Type.STRING,
                                    description: 'A paragraph of the story.'
                                },
                                imagePrompt: {
                                    type: Type.STRING,
                                    description: 'A simple, vibrant, and child-friendly image prompt for this paragraph, in English. Style: "A delightful and colorful illustration for a children\'s book".'
                                }
                            }
                        }
                    }
                }
            }
        }
    }));

    const storyData = JSON.parse(storyResponse.text || '{}');
    const storyPartsRaw = storyData.storyParts?.slice(0, 5) || []; // Ensure exactly 5 parts

    // Step 2 & 3: Generate images and audio for each part
    const storyPromises = storyPartsRaw.map(async (part: any, index: number) => {
        setProgress(`generatingImages`);
        const imagePromise = runWithRetry<GenerateImagesResponse>(() => ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: part.imagePrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
                outputMimeType: 'image/jpeg'
            }
        })).then(res => res.generatedImages[0].image.imageBytes);

        setProgress(`generatingAudio`);
        const audioPromise = runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: part.paragraph }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        })).then(async res => {
            const base64Audio = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                return await decodeAudioData(base64Audio, audioContext);
            }
            return null;
        });

        const [imageBase64, audioBuffer] = await Promise.all([imagePromise, audioPromise]);

        return {
            text: part.paragraph,
            imageBase64: `data:image/jpeg;base64,${imageBase64}`,
            audioBuffer,
        };
    });

    const finalStoryParts: StoryPart[] = await Promise.all(storyPromises);

    return { story: finalStoryParts };
}


export async function generateMnemonicImage(words: string[], lang: string): Promise<string> {
    const prompt = `Create a single, creative, memorable, and fun mnemonic image for a child to remember these words: ${words.join(', ')}. The image should visually connect all the words in a playful, vibrant and clever way. Style: "A delightful and colorful illustration for a children's book". The language of the words is ${lang}.`;
    
    const response = await runWithRetry<GenerateImagesResponse>(() => ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
            outputMimeType: 'image/jpeg'
        }
    }));
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export async function generateAdventureImage(userImageBase64: string, theme: string, lang: string): Promise<string> {
    const prompt = `Transform the person in this photo into ${theme}. Blend the person's face and features seamlessly into the new character and scene. The final style should be vibrant, high-quality, and child-friendly, like a still from a modern animated movie. The request is in ${lang}.`;

    const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: userImageBase64,
                        mimeType: 'image/jpeg',
                    },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    }));

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
    throw new Error("Failed to generate adventure image.");
}