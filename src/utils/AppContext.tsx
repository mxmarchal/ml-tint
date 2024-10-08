import { createContext, ReactNode, useState } from "react";

type AppContextType = {
	previewImage: string | null;
	setPreviewImage: (image: string | null) => void;
	labelInstances: LabelInstance[];
	setLabelInstances: (instances: LabelInstance[]) => void;
	// Nouveaux états et handlers
	filterConfidence: number;
	setFilterConfidence: (value: number) => void;
	cfgScale: number;
	setCfgScale: (value: number) => void;
	seed: number;
	setSeed: (value: number) => void;
	negativeText: string;
	setNegativeText: (value: string) => void;
	generationProcess: "prompt" | "image";
	setGenerationProcess: (value: "prompt" | "image") => void;
};

export type LabelInstance = {
	label: string;
	boundingBox: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	segments: {
		x: number;
		y: number;
	}[];
};

// Création du contexte
export const AppContext = createContext<AppContextType | null>(null);

// Fournisseur du contexte
export const AppProvider = ({ children }: { children: ReactNode }) => {
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [labelInstances, setLabelInstances] = useState<LabelInstance[]>([]);
	// Nouveaux états
	const [filterConfidence, setFilterConfidence] = useState<number>(0.5);
	const [cfgScale, setCfgScale] = useState<number>(5);
	const [seed, setSeed] = useState<number>(0);
	const [negativeText, setNegativeText] = useState<string>(
		"No hate, blood or violence"
	);
	const [generationProcess, setGenerationProcess] = useState<
		"prompt" | "image"
	>("prompt");

	return (
		<AppContext.Provider
			value={{
				previewImage,
				setPreviewImage,
				labelInstances,
				setLabelInstances,
				// Nouveaux états et handlers
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
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
