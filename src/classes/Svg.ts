import fs from "node:fs";

type SvgOptions = {
	HTMLContent: string;
	filename?: string;
	stylesheet: string;
	width: number;
	height: number;
};

export default class Svg extends File {
	public constructor({
		HTMLContent,
		stylesheet,
		width,
		height,
		filename = "image",
	}: SvgOptions) {
		if (!fs.existsSync(stylesheet)) {
			throw new Error(`Stylesheet '${stylesheet}' not found`);
		}

		const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>${fs.readFileSync(stylesheet, "utf8")}</style>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" class="container">${HTMLContent}</div>
      </foreignObject>
    </svg>`;

		super([content], filename, {
			type: "image/svg+xml",
		});
	}
}
