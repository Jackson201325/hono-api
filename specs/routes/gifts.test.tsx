import { describe, expect, test } from "bun:test";
import app from "../../app";

describe("Gifts", () => {
  describe("GET /api/gifts", () => {
    test("It should throw error when not passing event_id", async () => {
      const res = await app.request("/api/gifts");
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        event_id: ["Required"],
      });
    });

    test("It should throw error when not passing uuid to the event_id", async () => {
      const res = await app.request("/api/gifts?event_id=1");
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        event_id: ["Invalid uuid"],
      });
    });

    test("It should pass when passing at least event_id in the query", async () => {
      const res = await app.request(
        "/api/gifts?event_id=ea370d96-81bd-40b7-a46a-f38119d1586c",
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });
  });
});
