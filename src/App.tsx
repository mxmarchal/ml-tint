import { useContext } from "react";
import Preview from "./components/Preview";
import Settings from "./components/Settings";
import { AppContext } from "./utils/AppContext";

export default function App() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("App must be used within an AppContext.Provider");
	}
	const { logs } = context;

	return (
		<main className="flex min-h-screen flex-col items-center p-24 gap-4 bg-[#ff0080]">
			<h1 className="text-4xl font-bold text-black">Image Generator</h1>
			<div className="grid grid-cols-3 gap-4 w-full">
				<Preview />
				<Settings />
			</div>
			<textarea
				readOnly
				className="w-full h-40 p-2 border border-gray-300 rounded-md text-xs"
				value={logs.join("\n")}
			></textarea>
		</main>
	);
}
