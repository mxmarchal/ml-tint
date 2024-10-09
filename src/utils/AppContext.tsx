import { createContext, ReactNode, useState } from "react";

type AppContextType = {
	previewImage: Blob | null;
	setPreviewImage: (image: Blob | null) => void;
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
	maskImage: Blob | null;
	setMaskImage: (image: Blob | null) => void;
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
	const [maskImage, setMaskImage] = useState<Blob | null>(null);
	const [logs, setLogs] = useState<string[]>(["Waiting for image..."]);

	const addLog = (log: string) => {
		setLogs((logs) => [...logs, log]);
	};

	return (
		<AppContext.Provider
			value={{
				previewImage,
				setPreviewImage,
				maskImage,
				setMaskImage,
				labelInstances,
				setLabelInstances,
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
