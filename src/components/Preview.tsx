import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../utils/AppContext";
import { dimensions } from "../utils/dimensions";

export default function Preview() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("Preview must be used within an AppContext.Provider");
	}
	const { previewImage, setPreviewImage, maskImage, labelInstances, addLog } =
		context;

	const [toggleMask, setToggleMask] = useState(false);
	const [previewWithBoundingBox, setPreviewWithBoundingBox] =
		useState<Blob | null>(null);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			const reader = new FileReader();
			reader.onload = (event) => {
				const img = new Image();
				img.onload = () => {
					addLog("Preview: Image loaded");
					const originalRatio = img.width / img.height;
					addLog(`Preview: Original ratio: ${originalRatio}`);
					let closestRatio = "";
					let minDifference = Infinity;

					// Find the closest ratio
					for (const [ratio, size] of Object.entries(dimensions)) {
						const currentRatio = size.width / size.height;
						const difference = Math.abs(
							currentRatio - originalRatio
						);
						if (difference < minDifference) {
							minDifference = difference;
							closestRatio = ratio;
						}
					}
					addLog(`Preview: Closest ratio: ${closestRatio}`);
					// Resize the image
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					const { width, height } =
						dimensions[closestRatio as keyof typeof dimensions];
					addLog(`Preview: Resized image to ${width}x${height}`);
					canvas.width = width;
					canvas.height = height;
					ctx?.drawImage(img, 0, 0, width, height);

					// Convert canvas to blob and set preview image
					canvas.toBlob((blob) => {
						if (blob) {
							addLog("Preview: Blob created");
							setPreviewImage(blob);
						}
					}, file.type);
				};
				img.src = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		},
		[setPreviewImage]
	);

	useEffect(() => {
		if (!previewImage || !labelInstances || labelInstances.length === 0) {
			return;
		}
		const img = new Image();
		img.onload = () => {
			addLog("Preview BB: Image loaded");
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				return;
			}

			// Draw the preview image as background
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			// Draw bounding boxes on top
			labelInstances.forEach((label) => {
				ctx.strokeStyle = "#00FF00"; // Bright green color
				ctx.lineWidth = 2;
				const left = label.boundingBox.left * canvas.width;
				const top = label.boundingBox.top * canvas.height;
				const width = label.boundingBox.width * canvas.width;
				const height = label.boundingBox.height * canvas.height;

				// Draw the bounding box
				ctx.strokeRect(left, top, width, height);

				// Add label name and confidence
				const labelText = `${label.label} (${label.confidence.toFixed(
					3
				)})`;
				addLog(
					`Preview BB: rendering label ${labelText} (w: ${width}, h: ${height}, l: ${left}, t: ${top})`
				);
				ctx.fillStyle = "#FFFFFF"; // White background color
				ctx.fillRect(
					left + 2,
					top + 2,
					ctx.measureText(labelText).width + 20,
					20
				); // Draw white background
				ctx.fillStyle = "#000000"; // Black text color
				ctx.font = "14px monospace"; // Terminal-like font
				ctx.fillText(labelText, left + 5, top + 16); // Adjusted y-position for better alignment
			});

			// Convert canvas to blob and set previewWithBoundingBox
			canvas.toBlob((blob) => {
				if (blob) {
					setPreviewWithBoundingBox(blob);
				}
			});
		};
		img.src = URL.createObjectURL(previewImage);
	}, [previewImage, labelInstances]);

	const getBase64PreviewURL = useMemo(() => {
		if (!previewImage) {
			return null;
		}
		if (previewWithBoundingBox) {
			return URL.createObjectURL(previewWithBoundingBox);
		}
		return URL.createObjectURL(previewImage);
	}, [previewImage, previewWithBoundingBox]);

	const getBase64MaskURL = useMemo(() => {
		if (!maskImage) {
			return null;
		}
		return URL.createObjectURL(maskImage);
	}, [maskImage]);

	return (
		<div className="col-span-2 bg-blue-500">
			{previewImage === null ? (
				<div className="flex justify-center items-center h-full">
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						multiple={false}
					/>
				</div>
			) : (
				<div className="relative flex justify-center items-center h-full">
					{!toggleMask ? (
						<img
							src={getBase64PreviewURL || undefined}
							alt="Preview"
						/>
					) : (
						<img src={getBase64MaskURL || undefined} alt="Mask" />
					)}
					{maskImage !== null && (
						<button
							className="absolute bottom-0 right-0 m-4 p-2 bg-white rounded-md text-black"
							onClick={() => setToggleMask(!toggleMask)}
						>
							{toggleMask ? "Show Preview" : "Show Mask"}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
