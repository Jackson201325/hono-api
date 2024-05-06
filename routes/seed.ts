import { faker, simpleFaker } from "@faker-js/faker";
import { Hono } from "hono";
import type { z } from "zod";
import supabase from "../db/client";
import {
  CategorySchema,
  EventSchema,
  GiftSchema,
  GiftlistSchema,
  UserSchema,
  UserType,
  WishListSchema,
} from "../schemas";

const seedRoute = new Hono();

seedRoute.get("/seed", async (c) => {
  // Insert users into the database
  const insertUsers = await supabase.from("users").insert(users).select();

  // Insert events into the database
  const insertEvents = await supabase.from("events").insert(events).select();

  // Insert wishlists into the database
  const insertWishlists = await supabase
    .from("wishlists")
    .insert(wishlists)
    .select();

  // Insert categories into the database
  const insertCategories = await supabase
    .from("categories")
    .insert(categories)
    .select();

  // Insert gifts into the database
  const insertGifts = await supabase.from("gifts").insert(gifts).select();

  // Insert giftlists into the database
  const insertGiftlists = await supabase
    .from("giftlists")
    .insert(giftlists)
    .select();

  return c.json({
    success: true,
    message: "Seed data inserted successfully.",
    insertUsers,
    insertEvents,
    insertWishlists,
    insertCategories,
    insertGifts,
    insertGiftlists,
  });
});

export default seedRoute;

const generateSeedData = () => {
  const categories: z.infer<typeof CategorySchema>[] = [];
  const gifts: z.infer<typeof GiftSchema>[] = [];
  const users: z.infer<typeof UserSchema>[] = [];
  const events: z.infer<typeof EventSchema>[] = [];
  const wishlists: z.infer<typeof WishListSchema>[] = [];
  const giftlists: z.infer<typeof GiftlistSchema>[] = [];

  // Generate users, events, wishlists, and giftlists
  for (const _ of Array.from({ length: 2 })) {
    const user = UserSchema.safeParse({
      id: simpleFaker.string.uuid(),
      name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      email_verified: faker.date.past(),
      image: faker.image.url(),
      role: UserType.COUPLE,
      is_onboarded: faker.datatype.boolean(),
      has_pybank_account: faker.datatype.boolean(),
      onboarding_step: "1",
      is_magic_link_login: false,
    });

    if (user.success) {
      users.push(user.data);
      // Generate and insert categories

      const event = EventSchema.safeParse({
        id: simpleFaker.string.uuid(),
        name: faker.word.words({ count: { min: 5, max: 10 } }),
        date: faker.date.future(),
        location: faker.location.city(),
        url: faker.internet.url(),
        country: faker.location.country(),
      });

      if (event.success) {
        events.push(event.data);

        const giftlist = GiftlistSchema.safeParse({
          id: simpleFaker.string.uuid(),
          name: faker.commerce.product(),
          description: faker.commerce.productDescription(),
          total_price: "0",
          is_default: faker.datatype.boolean(),
          category_id: simpleFaker.string.uuid(),
          event_id: event.data.id,
        });

        if (giftlist.success) {
          giftlists.push(giftlist.data);

          for (const _ of Array.from({ length: 5 })) {
            const validatedCategory = CategorySchema.safeParse({
              id: simpleFaker.string.uuid(),
              name: faker.commerce.department(),
            });

            if (validatedCategory.success) {
              categories.push(validatedCategory.data);

              // Generate and insert predefined gifts for each category
              for (const _ of Array.from({ length: 15 })) {
                const gift = {
                  id: simpleFaker.string.uuid(),
                  name: faker.commerce.productName(),
                  description: faker.commerce.productDescription(),
                  price: faker.commerce.price(),
                  is_default: true,
                  image_url: faker.image.url(),
                  category_id: validatedCategory.data.id,
                  event_id: event.data.id, // Add event_id for each gift
                  giftlist_id: giftlist.data.id,
                };

                const validatedGift = GiftSchema.safeParse(gift);
                if (validatedGift.success) {
                  gifts.push(validatedGift.data);
                }
              }
            }
          }

          // Generate and insert newly created gifts
          for (const _ of Array.from({ length: 10 })) {
            const category = faker.helpers.arrayElement(categories);
            const gift = {
              id: simpleFaker.string.uuid(),
              name: faker.commerce.productName(),
              description: faker.commerce.productDescription(),
              price: faker.commerce.price(),
              is_default: false,
              image_url: faker.image.url(),
              category_id: category.id,
              event_id: event.data.id,
            };

            const validatedGift = GiftSchema.safeParse(gift);
            if (validatedGift.success) {
              gifts.push(validatedGift.data);
            }
          }

          const wishlist = WishListSchema.safeParse({
            id: simpleFaker.string.uuid(),
            description: faker.word.words({ count: { min: 5, max: 10 } }),
            event_id: event.data.id,
            total_gifts: "0",
            total_price: "0",
          });

          if (wishlist.success) {
            wishlists.push(wishlist.data);
          }
        }
      }
    }
  }

  return { categories, gifts, users, events, wishlists, giftlists };
};

const { categories, gifts, users, events, wishlists, giftlists } =
  generateSeedData();
