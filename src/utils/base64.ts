export const blobToBase64 = (blob: Blob) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

export const base64ToBlob = async (base64: string) => {
	const splitted = base64.split(",");
	const clean = splitted[splitted.length - 1];
	const blob = await fetch(`data:image/jpeg;base64,${clean}`).then((r) =>
		r.blob()
	);
	return blob;
};
