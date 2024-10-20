import Elysia from "elysia";
import routes from "./routes";

new Elysia().use(routes).listen(process.env.PORT!, ({ hostname, port }) => {
  console.log(`Server running at ${hostname}:${port}`);
});
