import Preview from "./components/Preview";
import Settings from "./components/Settings";

export default function App() {
	return (
		<main className="flex min-h-screen flex-col items-center p-24 dark:text-white gap-4">
			<h1 className="text-4xl font-bold text-black">Image Generator</h1>
			<div className="grid grid-cols-3 gap-4 w-full">
				<Preview />
				<Settings />
			</div>
		</main>
	);
}
