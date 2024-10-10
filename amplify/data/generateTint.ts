import {
	BedrockRuntimeClient,
	InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { Schema } from "./resource";

const client = new BedrockRuntimeClient();

export const handler: Schema["generateTint"]["functionHandler"] = async (
	event,
	context
) => {
	const image = event.arguments.image;
	const width = event.arguments.width;
	const height = event.arguments.height;
	const prompt = event.arguments.prompt;
	const negativeText = event.arguments.negativeText;
	const maskPrompt = event.arguments.maskPrompt;
	const maskImage = event.arguments.maskImage;
	const seed = event.arguments.seed;
	const cfgScale = event.arguments.cfgScale;

	if (!maskImage && !maskPrompt) {
		throw new Error("Either maskImage or maskPrompt must be provided.");
	}

	const input = {
		taskType: "INPAINTING",
		inPaintingParams: {
			image: image,
			text: prompt,
			negativeText: negativeText,
			...(maskImage ? { maskImage: maskImage } : {}),
			...(maskPrompt ? { maskPrompt: maskPrompt } : {}),
		},
		imageGenerationConfig: {
			numberOfImages: 1,
			width: width,
			height: height,
			cfgScale: cfgScale || 8,
			seed: seed || 0,
		},
	};

	const command = new InvokeModelCommand({
		modelId: process.env.MODEL_ID,
		contentType: "application/json",
		accept: "application/json",
		body: JSON.stringify(input),
	});

	const response = await client.send(command);
	const data = JSON.parse(Buffer.from(response.body).toString());

	return data.images[0];
};

// Helper function to convert Blob to Base64 string
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (reader.result) {
				resolve(reader.result as string);
			} else {
				reject(new Error("Failed to convert blob to Base64 string."));
			}
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};
