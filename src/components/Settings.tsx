import { useCallback, useContext, useState } from "react";
import { AppContext, LabelInstance } from "../utils/AppContext";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function Settings() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("Settings must be used within an AppContext.Provider");
	}

	const {
		labelInstances,
		filterConfidence,
		setFilterConfidence,
		cfgScale,
		setCfgScale,
		seed,
		setSeed,
		negativeText,
		setNegativeText,
		generationProcess,
		setGenerationProcess,
		previewImage,
		setLabelInstances,
		setMaskImage,
		addLog,
		maskImage,
		setGeneratedImage,
		width,
		height,
		setCurrentPreview,
	} = context;

	const [isGeneratingMask, setIsGeneratingMask] = useState(false);
	const [isGeneratingTint, setIsGeneratingTint] = useState(false);

	const setBWMask = useCallback(
		async (labelInstances: LabelInstance[]) => {
			if (!previewImage) {
				return;
			}
			const img = new Image();
			img.onload = () => {
				addLog("Settings: B&W mask generation started");
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d", {
					willReadFrequently: true,
				});
				if (!ctx) {
					return;
				}

				// Create an ImageData object
				const imageData = ctx.createImageData(
					canvas.width,
					canvas.height
				);
				const data = imageData.data;

				// Fill the entire image with white
				for (let i = 0; i < data.length; i += 4) {
					data[i] = 255; // R
					data[i + 1] = 255; // G
					data[i + 2] = 255; // B
					data[i + 3] = 255; // A
				}

				// Draw black rectangles for each label
				labelInstances.forEach((label) => {
					const left = Math.floor(
						label.boundingBox.left * canvas.width
					);
					const top = Math.floor(
						label.boundingBox.top * canvas.height
					);
					const right = Math.ceil(
						(label.boundingBox.left + label.boundingBox.width) *
							canvas.width
					);
					const bottom = Math.ceil(
						(label.boundingBox.top + label.boundingBox.height) *
							canvas.height
					);

					for (let y = top; y < bottom; y++) {
						for (let x = left; x < right; x++) {
							const index = (y * canvas.width + x) * 4;
							data[index] = 0; // R
							data[index + 1] = 0; // G
							data[index + 2] = 0; // B
							data[index + 3] = 255; // A
						}
					}
				});

				// Put the ImageData back to the canvas
				ctx.putImageData(imageData, 0, 0);

				canvas.toBlob((blob) => {
					if (blob) {
						setMaskImage(blob);
						addLog("Settings: B&W mask generation finished");
					}
				}, "image/png");
			};
			img.src = URL.createObjectURL(previewImage);
		},
		[labelInstances, previewImage, addLog, setMaskImage]
	);

	const generateLabels = useCallback(async () => {
		if (!previewImage) {
			return;
		}
		addLog("Settings: Generating labels");
		const blobToBase64 = (blob: Blob) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					resolve(reader.result);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		};
		let base64Image: string | null = null;
		try {
			base64Image = (await blobToBase64(previewImage)) as string;
		} catch (error) {
			console.error(error);
			return;
		}

		if (!base64Image) {
			return;
		}

		setIsGeneratingMask(true);
		try {
			const { data, errors } = await client.queries.getLabels({
				image: base64Image.split(",")[1],
				filterConfidence,
			});
			if (errors) {
				throw new Error(errors.toString());
			}
			const parsedData = JSON.parse(data as string) as LabelInstance[];
			setLabelInstances(parsedData);
			addLog(`Settings: Found ${parsedData.length} labels`);
			addLog("Settings: Labels generated");
			setBWMask(parsedData);
		} catch (error) {
			console.error(error);
		} finally {
			setIsGeneratingMask(false);
		}
	}, [previewImage, context]);

	const generateTint = useCallback(async () => {
		if (!previewImage || !maskImage) {
			return;
		}
		const blobToBase64 = (blob: Blob) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					resolve(reader.result);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		};
		let base64Image: string | null = null;
		let base64Mask: string | null = null;
		try {
			base64Image = (await blobToBase64(previewImage)) as string;
			base64Mask = (await blobToBase64(maskImage)) as string;
		} catch (error) {
			console.error(error);
			return;
		}
		if (!base64Image) {
			return;
		}
		setIsGeneratingTint(true);
		try {
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
			//data is a base64 string without the prefix, must be converted to blob
			const blob = await fetch(
				`data:image/jpeg;base64,${data as string}`
			).then((r) => r.blob());
			setGeneratedImage(blob);
			addLog("Settings: Image generated");
			setCurrentPreview(3);
		} catch (error) {
			console.error(error);
		} finally {
			setIsGeneratingTint(false);
		}
	}, [previewImage, maskImage, context]);

	return (
		<div className="col-span-1 bg-red-500 text-black p-4 gap-4 flex flex-col">
			<h1 className="text-2xl font-bold">Settings</h1>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<h2 className="text-xl">Segments</h2>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col">
							<label htmlFor="filterConfidence">
								Filter confidence (
								{Math.round(filterConfidence * 100)} %)
							</label>
							<input
								id="filterConfidence"
								type="range"
								min={0}
								max={1}
								step={0.01}
								value={filterConfidence}
								onChange={(e) =>
									setFilterConfidence(
										parseFloat(e.target.value)
									)
								}
							/>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="text-xl">Image</h2>
					<div className="flex flex-col">
						<label htmlFor="cfgScaleInput">
							cfgScale ({cfgScale})
						</label>
						<input
							id="cfgScaleInput"
							type="range"
							min={0}
							max={10}
							value={cfgScale}
							onChange={(e) =>
								setCfgScale(parseFloat(e.target.value))
							}
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="seedInput">Seed</label>
						<input
							id="seedInput"
							type="number"
							value={seed}
							onChange={(e) => setSeed(parseInt(e.target.value))}
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="negativeText">Negative text</label>
						<textarea
							id="negativeText"
							value={negativeText}
							onChange={(e) => setNegativeText(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col">
							<label htmlFor="mask">Generation process</label>
							<div className="flex flex-row space-x-4">
								<label className="flex items-center">
									<input
										type="radio"
										name="generationProcess"
										value="prompt"
										checked={generationProcess === "prompt"}
										disabled
										onChange={() =>
											setGenerationProcess("prompt")
										}
									/>
									<span className="ml-2">Prompt</span>
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="generationProcess"
										value="image"
										checked={generationProcess === "image"}
										onChange={() =>
											setGenerationProcess("image")
										}
									/>
									<span className="ml-2">Image</span>
								</label>
							</div>
						</div>
						<ul>
							<li>
								<b>Prompt:</b> use a prompt mask to change the
								tint (unavailable for now)
							</li>
							<li>
								<b>Image:</b> use an image mask (B&W) to change
								the tint (more precise)
							</li>
						</ul>
					</div>
				</div>
			</div>
			<button
				disabled={isGeneratingMask || !previewImage}
				className={`bg-blue-500 text-white p-2 rounded-md ${
					isGeneratingMask || !previewImage || isGeneratingTint
						? "opacity-50 cursor-not-allowed"
						: ""
				}`}
				onClick={generateLabels}
			>
				{isGeneratingMask ? "Generating..." : "Generate segments"}
			</button>
			<button
				disabled={labelInstances.length === 0 || isGeneratingTint}
				className={`bg-blue-500 text-white p-2 rounded-md ${
					labelInstances.length === 0 || isGeneratingTint
						? "opacity-50 cursor-not-allowed"
						: ""
				}`}
				onClick={generateTint}
			>
				{isGeneratingTint ? "Generating..." : "Generate image"}
			</button>
		</div>
	);
}
