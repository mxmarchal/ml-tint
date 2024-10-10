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
			maskPrompt: maskPrompt, //  can also use prompt to descripte where the changes
			maskImage: maskImage, // base 64 of mask (black no change, white changes)
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
		modelId: "amazon.titan-image-generator-v2:0",
		body: JSON.stringify(input),
	});

	const response = await client.send(command);

	if (!response.body) {
		throw new Error("Unable to generate the image.");
	}

	const blob = new Blob([response.body], { type: "image/jpeg" });

	// Convert Blob to base64 string
	const base64String = await convertBlobToBase64(blob);

	return base64String;
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
