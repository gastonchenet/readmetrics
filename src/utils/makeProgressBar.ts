const BAR_WIDTH = 460;
const FLOAT_ERROR = 1;

export type ProgressData = {
	prop: number;
	color: string;
};

export default function makeProgressBar(
	lines: ProgressData[],
	width: number = BAR_WIDTH
) {
	lines.sort((a, b) => b.prop - a.prop);

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 8" width="${width}" height="8">
		<mask id="rounded">
			<rect x="0" y="0" width="${width}" height="8" rx="4" ry="4" fill="white" />
		</mask>
		<rect x="0" y="0" width="${width}" height="8" fill="#c4c4c4" mask="url(#rounded)" />
		${lines
			.map(
				({ prop, color }, index) =>
					`<rect x="${Math.max(
						0,
						lines
							.slice(0, index)
							.reduce((acc, { prop }) => acc + prop * width, 0) - FLOAT_ERROR
					)}" y="0" width="${
						prop * width + FLOAT_ERROR
					}" height="8" fill="${color}" mask="url(#rounded)" />`
			)
			.join("")}
  </svg>`;
}
