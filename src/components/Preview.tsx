import { useContext, useMemo } from "react";
import { AppContext } from "../utils/AppContext";
import { dimensions } from "../utils/dimensions";

export default function Preview() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("Preview must be used within an AppContext.Provider");
	}
	const { previewImage, setPreviewImage } = context;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const originalRatio = img.width / img.height;
				let closestRatio = "";
				let minDifference = Infinity;

				// Find the closest ratio
				for (const [ratio, size] of Object.entries(dimensions)) {
					const currentRatio = size.width / size.height;
					const difference = Math.abs(currentRatio - originalRatio);
					if (difference < minDifference) {
						minDifference = difference;
						closestRatio = ratio;
					}
				}

				// Resize the image
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				const { width, height } =
					dimensions[closestRatio as keyof typeof dimensions];
				canvas.width = width;
				canvas.height = height;
				ctx?.drawImage(img, 0, 0, width, height);

				// Convert canvas to blob and set preview image
				canvas.toBlob((blob) => {
					if (blob) {
						setPreviewImage(URL.createObjectURL(blob));
					}
				}, file.type);
			};
			img.src = event.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const getBase64URL = useMemo(() => {
		if (!previewImage) {
			return null;
		}
		return previewImage;
	}, [previewImage]);

	console.log("previewImage", previewImage);

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
				<div className="flex justify-center items-center h-full">
					<img src={getBase64URL || undefined} alt="Preview" />
				</div>
			)}
		</div>
	);
}
