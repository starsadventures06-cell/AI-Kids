
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove "data:image/jpeg;base64," prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};


// The audio bytes returned by the API is raw PCM data. It is not a standard file format.
// This function decodes the base64 string and creates an AudioBuffer.

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(
    base64: string,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1,
): Promise<AudioBuffer> {
    const data = decode(base64);
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

/**
 * Retries an async operation with exponential backoff if a 429 or 503 error occurs.
 */
export async function runWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    baseDelay: number = 2000
): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        const isQuotaError = 
            error?.status === 429 || 
            error?.code === 429 || 
            error?.message?.includes('429') || 
            error?.message?.includes('Quota') || 
            error?.message?.includes('quota') ||
            error?.status === 'RESOURCE_EXHAUSTED';
            
        const isServerBusy = error?.status === 503 || error?.code === 503;

        if (retries > 0 && (isQuotaError || isServerBusy)) {
            console.warn(`API Busy or Quota limit hit. Retrying in ${baseDelay}ms... (Attempts left: ${retries})`);
            await new Promise((resolve) => setTimeout(resolve, baseDelay));
            return runWithRetry(operation, retries - 1, baseDelay * 2);
        }
        
        throw error;
    }
}
