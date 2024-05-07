import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import supabase from "../db/client";
import { EventPathParamsSchema, EventPostSchema } from "../schemas";

const eventsRoute = new Hono();

// Create an event
eventsRoute.post("/", zValidator("json", EventPostSchema), async (c) => {
  const event = c.req.valid("json");

  const { data, error } = await supabase.from("events").insert(event);
  if (error) {
    c.status(500);
    return c.json({ error: "Failed to create event" });
  }
  c.status(201);
  return c.json(data);
});

// Get a single event by ID
eventsRoute.get(
  "/:id",
  zValidator("param", EventPathParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { data, error } = await supabase
      .from("events")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error) {
      c.status(404);
      return c.json({ error: "Event not found" });
    }

    if (data) {
      c.status(200);
      return c.json(data);
    }
  },
);

// Update an event by ID
eventsRoute.put(
  "/:id",
  zValidator("param", EventPathParamsSchema),
  zValidator("json", EventPostSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const eventUpdates = c.req.valid("json");
    const { data, error } = await supabase
      .from("events")
      .update(eventUpdates)
      .eq("id", id);
    if (error) {
      c.status(500);
      return c.json({ error: "Failed to update event" });
    }
    c.status(200);
    return c.json(data);
  },
);

// Delete an event by ID
eventsRoute.delete(
  "/:id",
  zValidator("param", EventPathParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      c.status(500);
      return c.json({ error: "Failed to delete event" });
    }

    c.status(204);
    return c.json({ message: "Event deleted successfully" });
  },
);

export default eventsRoute;
