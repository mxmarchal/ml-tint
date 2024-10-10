import { useContext } from "react";
import { AppContext } from "../utils/AppContext";

export default function PreviewButtons() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error(
			"PreviewButtons must be used within an AppContext.Provider"
		);
	}

	const {
		previewImage,
		maskImage,
		previewWithBoundingBox,
		currentPreview,
		setCurrentPreview,
	} = context;

	const buttons = [
		{
			id: 0,
			name: "Preview",
			disabled: previewImage === null,
			active: currentPreview === 0,
		},
		{
			id: 1,
			name: "Bounding Box",
			disabled: previewWithBoundingBox === null,
			active: currentPreview === 1,
		},
		{
			id: 2,
			name: "Mask",
			disabled: maskImage === null,
			active: currentPreview === 2,
		},
		{
			id: 3,
			name: "Inpaint",
			disabled: true,
			active: currentPreview === 3,
		},
	];

	return (
		<div className="absolute bottom-2 gap-2 flex justify-center w-full">
			{buttons.map((button) => (
				<button
					key={button.id}
					disabled={button.disabled}
					onClick={() => setCurrentPreview(button.id)}
					className={`${
						button.active ? "bg-green-500" : "bg-gray-500"
					} text-white p-2 rounded-md ${
						button.disabled
							? "opacity-50 cursor-not-allowed"
							: "opacity-100"
					}`}
				>
					{button.name}
				</button>
			))}
		</div>
	);
}
