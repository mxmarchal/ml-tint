import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { LabelInstance } from "./AppContext";
import { generateMask } from "./generateMask";
import { base64ToBlob, blobToBase64 } from "./base64";

const client = generateClient<Schema>();

type GenerateTint = {
	base64Image: string;
	width: number;
	height: number;
	negativeText: string;
	seed: number;
	cfgScale: number;
};

type GenerateTintWithImageMultiSteps = GenerateTint & {
	labelInstances: LabelInstance[];
};

export async function generateTintWithImageMultiSteps({
	base64Image,
	width,
	height,
	negativeText,
	labelInstances,
	seed,
	cfgScale,
}: GenerateTintWithImageMultiSteps) {
	let currentImage = base64Image;
	for (let i = 0; i < labelInstances.length; i++) {
		const currentImageBlob = await base64ToBlob(currentImage);
		try {
			const maskBlob = (await blobToBase64(
				await generateMask(currentImageBlob, labelInstances, i)
			)) as string;
			const blob = await generateTintWithMask({
				base64Image: currentImage,
				width,
				height,
				negativeText,
				base64Mask: maskBlob,
				seed,
				cfgScale,
			});
			currentImage = (await blobToBase64(blob)) as string;
		} catch (error) {
			console.error(error);
		}
	}

	return base64ToBlob(currentImage);
}

type GenerateTintWithMaskProps = GenerateTint & {
	base64Mask: string;
};

export async function generateTintWithMask({
	base64Image,
	width,
	height,
	negativeText,
	base64Mask,
	seed,
	cfgScale,
}: GenerateTintWithMaskProps) {
	const { data, errors } = await client.queries.generateTint({
		image: base64Image.split(",")[1],
		width,
		height,
		prompt: "Change the objects by a pink variations",
		negativeText,
		maskImage: base64Mask.split(",")[1],
		seed,
		cfgScale,
	});
	if (errors) {
		throw new Error(errors.toString());
	}
	const blob = await base64ToBlob(data as string);
	return blob;
}
