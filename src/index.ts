import Elysia from "elysia";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import routes from "./routes";
import Config from "./classes/Config";

await Config.load();

new Elysia()
	.use(cors({ origin: "*", methods: ["GET"] }))
	.use(swagger({ path: "/docs" }))
	.onAfterHandle(({ request }) => {
		console.log(`[${request.method}] ${new URL(request.url).pathname}`);
	})
	.use(routes)
	.listen(Config.PORT, ({ hostname, port }) => {
		console.log(`Server running at ${hostname}:${port}`);
	});
