import { test, expect } from "bun:test";
import weekColor from "../src/utils/weekColor";
import secureHTML from "../src/utils/secureHTML";
import formatBytes from "../src/utils/formatBytes";
import loadIcon from "../src/utils/loadIcon";

test("Week Color", () => {
	expect(
		weekColor({
			firstDay: "2021-10-10",
			contributionDays: [
				{ contributionCount: 0 },
				{ contributionCount: 1 },
				{ contributionCount: 2 },
				{ contributionCount: 3 },
				{ contributionCount: 4 },
				{ contributionCount: 5 },
				{ contributionCount: 6 },
			],
		})
	).toBe("#216e39");

	expect(
		weekColor({
			firstDay: "2021-10-10",
			contributionDays: [
				{ contributionCount: 5 },
				{ contributionCount: 0 },
				{ contributionCount: 0 },
				{ contributionCount: 0 },
				{ contributionCount: 2 },
				{ contributionCount: 1 },
				{ contributionCount: 0 },
			],
		})
	).toBe("#40c463");
});

test("Secure HTML", () => {
	expect(secureHTML(Math.random().toString())).toBeString();

	expect(secureHTML("Hello, World!")).toBe("Hello, World!");

	expect(secureHTML("Hello, <script>alert('World!')</script>")).toBe(
		"Hello, &#60;script&#62;alert(&#39;World!&#39;)&#60;/script&#62;"
	);

	expect(secureHTML("Hello, &")).toBe("Hello, &#38;");
	expect(secureHTML("Hello, >")).toBe("Hello, &#62;");
	expect(secureHTML("Hello, <")).toBe("Hello, &#60;");
	expect(secureHTML("Hello, \u00A0")).toBe("Hello, &#160;");
	expect(secureHTML("Hello, \u9999")).toBe("Hello, &#39321;");
});

test("Format Bytes", () => {
	expect(
		formatBytes(Math.random() * 1024 ** Math.floor(Math.random() * 8))
	).toBeString();

	expect(formatBytes(0)).toBe("0 B");
	expect(formatBytes(1024)).toBe("1 KB");
	expect(formatBytes(1024 ** 2 * 4)).toBe("4 MB");
	expect(formatBytes(1024 ** 3 * 9)).toBe("9 GB");
	expect(formatBytes(1024 ** 4 * 3)).toBe("3 TB");
	expect(formatBytes(1024 ** 5 * 6)).toBe("6 PB");
	expect(formatBytes(1024 ** 6 * 7)).toBe("7 EB");
	expect(formatBytes(1024 ** 7 * 8)).toBe("8 ZB");
	expect(formatBytes(1024 ** 8)).toBe("1 YB");

	expect(formatBytes(Math.random() * 1024 ** 2)).toMatch(/\d+\.\d+ KB/);
	expect(formatBytes(Math.random() * 1024 ** 3)).toMatch(/\d+\.\d+ MB/);

	expect(formatBytes(-1)).toBeNaN();
});

test("Icon Loading", async () => {
	expect(await loadIcon("login")).toBeString();
	expect(await loadIcon("repo")).toBe(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="18px" width="18px" fill="#97979c">\r\n  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>\r\n</svg>'
	);

	expect(async () => {
		await loadIcon(Math.random().toString());
	}).toThrow(Error);
});
