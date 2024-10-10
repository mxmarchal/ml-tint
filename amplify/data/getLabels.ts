import {
	DetectLabelsCommand,
	RekognitionClient,
} from "@aws-sdk/client-rekognition";
import type { Schema } from "./resource";

const client = new RekognitionClient();

export const handler: Schema["getLabels"]["functionHandler"] = async (
	event,
	context
) => {
	const image = event.arguments.image;
	const filterConfidence = event.arguments.filterConfidence || 50;

	const input = {
		Image: {
			Bytes: Buffer.from(image, "base64"),
		},
	};

	console.log("input", input);

	const command = new DetectLabelsCommand(input);

	const response = await client.send(command);

	console.log("response", response);

	// first remove every label that don't have a Instances with at least 1 BoundingBox
	let filteredLabels = response.Labels?.filter(
		(label) => label.Instances && label.Instances.length > 0
	);

	// remove every label that has a confidence score less than 50
	filteredLabels = filteredLabels?.filter(
		(label) => label.Confidence && label.Confidence >= filterConfidence
	);

	// keep only the Instances with the highest confidence score
	filteredLabels = filteredLabels
		?.map((label) => {
			if (!label.Instances) {
				return null;
			}
			const highestConfidenceInstance = label.Instances.reduce(
				(max, instance) =>
					max.Confidence &&
					instance.Confidence &&
					max.Confidence > instance.Confidence
						? max
						: instance,
				label.Instances[0]
			);
			return {
				...label,
				Instances: [highestConfidenceInstance],
			};
		})
		.filter((label) => label !== null);

	// now convert to the format i want
	const result = filteredLabels
		?.map((label) => {
			if (
				!label.Instances ||
				!label.Instances[0].BoundingBox ||
				!label.Name ||
				!label.Confidence ||
				!label.Instances[0].Confidence ||
				!label.Instances[0].BoundingBox.Width ||
				!label.Instances[0].BoundingBox.Height ||
				!label.Instances[0].BoundingBox.Left ||
				!label.Instances[0].BoundingBox.Top
			) {
				return null;
			}
			return {
				label: label.Name,
				confidence: label.Confidence,
				boundingBox: {
					width: label.Instances[0].BoundingBox.Width,
					height: label.Instances[0].BoundingBox.Height,
					left: label.Instances[0].BoundingBox.Left,
					top: label.Instances[0].BoundingBox.Top,
				},
			};
		})
		.filter((label) => label !== null);

	return result || null;
};
