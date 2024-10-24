import path from "node:path";

export default async function loadIcon(icon: string) {
	const iconPath = path.join(
		process.cwd(),
		"public/assets/images",
		icon + ".svg"
	);

	const iconFile = Bun.file(iconPath);

	if (!(await iconFile.exists())) {
		throw new Error(`Icon '${icon}' not found`);
	}

	return iconFile.text();
}
