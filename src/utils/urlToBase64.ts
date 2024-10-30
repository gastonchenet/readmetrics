export default async function urlToBase64(url: string) {
	const response = await fetch(url);
	const blob = await response.blob();
	const arrayBuffer = await blob.arrayBuffer();

	return `data:${response.headers.get("content-type")};base64,${Buffer.from(
		arrayBuffer
	).toString("base64")}`;
}
