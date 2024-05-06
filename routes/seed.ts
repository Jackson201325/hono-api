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
  const { categories, gifts, users, events, wishlists, giftlists } =
    generateSeedData();

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

  const insertGiftlists = await supabase
    .from("giftlists")
    .insert(giftlists)
    .select();

  // Insert gifts into the database
  const insertGifts = await supabase.from("gifts").insert(gifts).select();

  return c.json({
    insertUsers,
    insertEvents,
    insertWishlists,
    insertCategories,
    insertGiftlists,
    insertGifts,
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
      // email_verified: faker.date.past().toString(),
      image: faker.image.url(),
      role: UserType.COUPLE,
      is_onboarded: faker.datatype.boolean(),
      has_pybank_account: faker.datatype.boolean(),
      onboarding_step: "1",
      is_magic_link_login: false,
    });

    if (user.success) {
      users.push(user.data);
    }
  }

  const event = EventSchema.safeParse({
    id: simpleFaker.string.uuid(),
    name: faker.word.words({ count: { min: 5, max: 10 } }),
    // date: faker.date.future().toString(),
    location: faker.location.city(),
    url: faker.internet.url(),
    country: faker.location.country(),
    primary_user_id: users[0].id,
    secondary_user_id: users[1].id,
  });

  if (event.success) {
    events.push(event.data);

    for (const _ of Array.from({ length: 5 })) {
      const validatedCategory = CategorySchema.safeParse({
        id: simpleFaker.string.uuid(),
        name: faker.commerce.department(),
      });

      if (validatedCategory.success) {
        categories.push(validatedCategory.data);

        for (const _ of Array.from({ length: 5 })) {
          const validatedGiftlist = GiftlistSchema.safeParse({
            id: simpleFaker.string.uuid(),
            name: faker.commerce.product(),
            description: faker.commerce.productDescription(),
            total_price: "0",
            is_default: faker.datatype.boolean(),
            category_id: validatedCategory.data.id,
            event_id: event.data.id,
          });

          if (validatedGiftlist.success) {
            giftlists.push(validatedGiftlist.data);

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
                giftlist_id: validatedGiftlist.data.id,
              };

              const validatedGift = GiftSchema.safeParse(gift);

              if (validatedGift.success) {
                gifts.push(validatedGift.data);
              }
            }
          }
        }
      }
    }

    // Generate and insert newly created gifts
    for (const _ of Array.from({ length: 80 })) {
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

  return { categories, gifts, users, events, wishlists, giftlists };
};
