import { describe, expect, test } from "bun:test";
import app from "../../app";

describe("Gifts", () => {
  describe("GET /api/gifts", () => {
    test("It should throw error when not passing event_id", async () => {
      const res = await app.request("/api/gifts?event_id=1");
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        event_id: ["Invalid uuid"],
      });
    });
  });
});
