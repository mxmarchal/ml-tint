import { useContext } from "react";
import { AppContext } from "../utils/AppContext";

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
	} = context;

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
								tint
							</li>
							<li>
								<b>Image:</b> use a image mask (B&W) to change
								the tint (more precise)
							</li>
						</ul>
					</div>
				</div>
			</div>
			<button className="bg-blue-500 text-white p-2 rounded-md">
				Generate segments
			</button>
			<button
				disabled={labelInstances.length === 0}
				className={`bg-blue-500 text-white p-2 rounded-md ${
					labelInstances.length === 0
						? "opacity-50 cursor-not-allowed"
						: ""
				}`}
			>
				Generate image
			</button>
		</div>
	);
}
