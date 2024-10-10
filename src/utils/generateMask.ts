import { LabelInstance } from "./AppContext";

function generateWhiteBox(
	data: Uint8ClampedArray,
	labelInstance: LabelInstance,
	cWidth: number,
	cHeight: number
) {
	const left = Math.floor(labelInstance.boundingBox.left * cWidth);
	const top = Math.floor(labelInstance.boundingBox.top * cHeight);
	const width = Math.floor(labelInstance.boundingBox.width * cWidth);
	const height = Math.floor(labelInstance.boundingBox.height * cHeight);

	for (let y = top; y < top + height; y++) {
		for (let x = left; x < left + width; x++) {
			const index = (y * cWidth + x) * 4;
			data[index] = 0; // R
			data[index + 1] = 0; // G
			data[index + 2] = 0; // B
			data[index + 3] = 255; // A
		}
	}

	return data;
}

export async function generateMask(
	previewImage: Blob,
	labelInstances: LabelInstance[],
	index?: number
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext("2d", {
				willReadFrequently: true,
			});
			if (!ctx) {
				reject(new Error("Failed to generate mask"));
				return;
			}

			const imageData = ctx.createImageData(canvas.width, canvas.height);
			let data = imageData.data;

			// Fill the entire image with white
			for (let i = 0; i < data.length; i += 4) {
				data[i] = 255; // R
				data[i + 1] = 255; // G
				data[i + 2] = 255; // B
				data[i + 3] = 255; // A
			}
			if (index !== undefined) {
				data = generateWhiteBox(
					data,
					labelInstances[index],
					canvas.width,
					canvas.height
				);
			} else {
				labelInstances.forEach((label) => {
					data = generateWhiteBox(
						data,
						label,
						canvas.width,
						canvas.height
					);
				});
			}

			ctx.putImageData(imageData, 0, 0);
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Failed to generate mask"));
				}
				return;
			}, "image/png");
		};
		img.src = URL.createObjectURL(previewImage);
	});
}
