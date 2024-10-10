import { useCallback, useContext, useState } from "react";
import { AppContext, LabelInstance } from "../utils/AppContext";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { blobToBase64 } from "../utils/base64";
import { generateMask } from "../utils/generateMask";
import {
	generateTintWithImageMultiSteps,
	generateTintWithMask,
} from "../utils/generateTint";

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
			try {
				const blob = await generateMask(previewImage, labelInstances);
				setMaskImage(blob);
			} catch (error) {
				console.error(error);
			}
		},
		[labelInstances, previewImage, addLog, setMaskImage]
	);

	const generateLabels = useCallback(async () => {
		if (!previewImage) {
			return;
		}
		addLog("Settings: Generating labels");
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
			let blob: Blob | null = null;
			if (generationProcess === "image-multi") {
				blob = await generateTintWithImageMultiSteps({
					base64Image,
					width,
					height,
					negativeText,
					labelInstances,
					seed,
					cfgScale,
				});
			} else {
				blob = await generateTintWithMask({
					base64Image: base64Image,
					width,
					height,
					negativeText,
					base64Mask: base64Mask,
					seed,
					cfgScale,
				});
			}
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
								<label className="flex items-center">
									<input
										type="radio"
										name="generationProcess"
										value="image-multi"
										checked={
											generationProcess === "image-multi"
										}
										onChange={() =>
											setGenerationProcess("image-multi")
										}
									/>
									<span className="ml-2">
										Image Multi-steps
									</span>
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
								the tint (accurate+, price+)
							</li>
							<li>
								<b>Image Multi-steps:</b> use an image mask
								(B&W) to change the tint with a gen for each
								label (accurate++, price++)
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
