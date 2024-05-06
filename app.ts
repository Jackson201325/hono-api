import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import giftslistsRoute from "./routes/giftlists";
import giftsRoute from "./routes/gifts";
import seedRoute from "./routes/seed";
import wishlistsRoute from "./routes/wishlist";
import categoriesRoute from "./routes/categories";

const app = new Hono().basePath("/api");

app.route("/gifts", giftsRoute);
app.route("/giftlsts", giftslistsRoute);
app.route("/wishlists", wishlistsRoute);
app.route("/categories", categoriesRoute);
app.route("/", seedRoute);

showRoutes(app);

export default app;
