import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import supabase from "../db/client";
import {
  GiftlistPostSchema,
  GiftslistPathParamsSchema,
  GiftslistQueryParamsSchema,
} from "../schemas";

export const giftslistsRoute = new Hono();

// Fetch giftlists with optional query parameters
giftslistsRoute.get(
  "/",
  zValidator("query", GiftslistQueryParamsSchema),
  async (c) => {
    const { is_default, itemsPerPage, name, page, category_id } =
      c.req.valid("query");

    const query = supabase.from("giftlists").select();

    if (itemsPerPage !== undefined && page !== undefined) {
      query.range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
    }

    if (is_default !== undefined) {
      query.eq("is_default", is_default);
    }

    if (name) {
      query.ilike("name", `%${name}%`);
    }

    if (category_id) {
      query.ilike("category_id", `%${category_id}%`);
    }

    const { data, error } = await query;

    if (error) {
      c.status(500);
      return c.json({ error: "Failed to fetch giftlists" });
    }

    c.status(200);
    return c.json(data);
  },
);

// Get a single giftlist by ID
giftslistsRoute.get(
  "/:id",
  zValidator("param", GiftslistPathParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const { data, error } = await supabase
      .from("giftlists")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      c.status(404);
      return c.json({ error: "Giftlist not found" });
    }

    c.status(200);
    return c.json(data);
  },
);

// Create a new giftlist
giftslistsRoute.post("/", zValidator("json", GiftlistPostSchema), async (c) => {
  const giftlist = c.req.valid("json");

  const { data, error } = await supabase.from("giftlists").insert(giftlist);

  if (error) {
    c.status(500);
    return c.json({ error: "Failed to create giftlist" });
  }

  c.status(201);
  return c.json(data);
});

// Update a giftlist by ID
giftslistsRoute.put(
  "/:id",
  zValidator("param", GiftslistPathParamsSchema),
  zValidator("json", GiftlistPostSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const giftUpdates = c.req.valid("json");

    const { data, error } = await supabase
      .from("giftlists")
      .update(giftUpdates)
      .eq("id", id);

    if (error) {
      c.status(500);
      return c.json({ error: "Failed to update giftlist" });
    }

    c.status(200);
    return c.json(data);
  },
);

// Delete a giftlist by ID
giftslistsRoute.delete(
  "/:id",
  zValidator("param", GiftslistPathParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const { error } = await supabase.from("giftlists").delete().eq("id", id);

    if (error) {
      c.status(500);
      return c.json({ error: "Failed to delete Giftlist" });
    }

    c.status(204);
    return c.json({ message: "Giftlist deleted successfully" });
  },
);

export default giftslistsRoute;
