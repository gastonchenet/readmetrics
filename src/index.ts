import Elysia from "elysia";
import swagger from "@elysiajs/swagger";
import routes from "./routes";
import Config from "./classes/Config";
import cors from "@elysiajs/cors";

await Config.load();

new Elysia()
	.use(cors({ origin: "*" }))
	.use(swagger())
	.onAfterHandle(({ request }) => {
		console.log(`[${request.method}] ${new URL(request.url).pathname}`);
	})
	.use(routes)
	.listen(Config.PORT, ({ hostname, port }) => {
		console.log(`Server running at ${hostname}:${port}`);
	});
