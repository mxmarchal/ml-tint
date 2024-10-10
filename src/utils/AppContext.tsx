import { createContext, ReactNode, useState } from "react";

type AppContextType = {
	previewImage: Blob | null;
	setPreviewImage: (image: Blob | null) => void;
	previewWithBoundingBox: Blob | null;
	setPreviewWithBoundingBox: (image: Blob | null) => void;
	maskImage: Blob | null;
	setMaskImage: (image: Blob | null) => void;
	currentPreview: number;
	setCurrentPreview: (value: number) => void;
	generatedImage: Blob | null;
	setGeneratedImage: (image: Blob | null) => void;

	labelInstances: LabelInstance[];
	setLabelInstances: (instances: LabelInstance[]) => void;
	filterConfidence: number;
	setFilterConfidence: (value: number) => void;
	cfgScale: number;
	setCfgScale: (value: number) => void;
	seed: number;
	setSeed: (value: number) => void;
	negativeText: string;
	setNegativeText: (value: string) => void;
	width: number;
	setWidth: (value: number) => void;
	height: number;
	setHeight: (value: number) => void;
	generationProcess: "prompt" | "image" | "image-multi";
	setGenerationProcess: (value: "prompt" | "image" | "image-multi") => void;
	logs: string[];
	addLog: (log: string) => void;
};

export type LabelInstance = {
	label: string;
	confidence: number;
	boundingBox: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
};

// Création du contexte
export const AppContext = createContext<AppContextType | null>(null);

// Fournisseur du contexte
export const AppProvider = ({ children }: { children: ReactNode }) => {
	const [previewImage, setPreviewImage] = useState<Blob | null>(null);
	const [maskImage, setMaskImage] = useState<Blob | null>(null);
	const [previewWithBoundingBox, setPreviewWithBoundingBox] =
		useState<Blob | null>(null);
	const [generatedImage, setGeneratedImage] = useState<Blob | null>(null);
	const [currentPreview, setCurrentPreview] = useState<number>(0);

	const [labelInstances, setLabelInstances] = useState<LabelInstance[]>([]);
	// Nouveaux états
	const [width, setWidth] = useState<number>(0);
	const [height, setHeight] = useState<number>(0);
	const [filterConfidence, setFilterConfidence] = useState<number>(0.5);
	const [cfgScale, setCfgScale] = useState<number>(5);
	const [seed, setSeed] = useState<number>(0);
	const [negativeText, setNegativeText] = useState<string>(
		"No hate, blood or violence"
	);
	const [generationProcess, setGenerationProcess] = useState<
		"prompt" | "image" | "image-multi"
	>("image");
	const [logs, setLogs] = useState<string[]>(["Waiting for image..."]);

	const addLog = (log: string) => {
		setLogs((logs) => [...logs, log]);
	};

	return (
		<AppContext.Provider
			value={{
				previewImage,
				setPreviewImage,
				previewWithBoundingBox,
				setPreviewWithBoundingBox,
				maskImage,
				setMaskImage,
				generatedImage,
				setGeneratedImage,
				currentPreview,
				setCurrentPreview,
				labelInstances,
				setLabelInstances,
				width,
				setWidth,
				height,
				setHeight,
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
				logs,
				addLog,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
