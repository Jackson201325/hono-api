import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import supabase from "../db/client";
import {
  GiftPostSchema,
  GiftsPathParamsSchema,
  GiftsQueryParamsSchema,
} from "../schemas";

const giftsRoute = new Hono();

// Fetch gifts with optional query parameters
giftsRoute.get("/", zValidator("query", GiftsQueryParamsSchema), async (c) => {
  const { is_default, itemsPerPage, name, page, giftlist_id, category_id } =
    c.req.valid("query");

  const query = supabase.from("event_gifts").select();

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
    query.eq("category_id", category_id); // Removed the percentage signs as they are not required for an exact match
  }

  if (giftlist_id) {
    query.eq("giftlist_id", giftlist_id); // Same here, removed the percentage signs
  }

  const { data, error } = await query;

  if (error) {
    c.status(500);
    return c.json({ error: "Failed to fetch gifts" });
  }

  c.status(200);
  return c.json(data);
});

// Get a single gift by ID
giftsRoute.get(
  "/:id",
  zValidator("param", GiftsPathParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const { data, error } = await supabase
      .from("gifts")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      c.status(404);
      return c.json({ error: "Gift not found" });
    }

    c.status(200);
    return c.json(data);
  },
);

// Create a new gift
giftsRoute.post("/", zValidator("json", GiftPostSchema), async (c) => {
  const gift = c.req.valid("json");

  const { data, error } = await supabase.from("gifts").insert(gift);

  if (error) {
    c.status(500);
    return c.json({ error: "Failed to create gift" });
  }

  c.status(201);
  return c.json(data);
});

// Update a gift by ID
giftsRoute.put(
  "/:id",
  zValidator("param", GiftsPathParamsSchema),
  zValidator("json", GiftPostSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const giftUpdates = c.req.valid("json");

    const { data, error } = await supabase
      .from("gifts")
      .update(giftUpdates)
      .eq("id", id);

    if (error) {
      c.status(500);
      return c.json({ error: "Failed to update gift" });
    }

    c.status(200);
    return c.json(data);
  },
);

// Delete a gift by ID
giftsRoute.delete(
  "/:id",
  zValidator("param", GiftsPathParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const { error } = await supabase.from("gifts").delete().eq("id", id);

    if (error) {
      c.status(500);
      return c.json({ error: "Failed to delete gift" });
    }

    c.status(204);
    return c.json({ message: "Gift deleted successfully" });
  },
);

export default giftsRoute;
