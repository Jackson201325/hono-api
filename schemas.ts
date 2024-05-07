import { z } from "zod";

// Define the base schema without the ID and without the refine method.
const BaseEventSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  url: z.string().url().min(1).max(255),
  country: z.string().optional(),
  event_type: z.string().default("WEDDING"),
  primary_user_id: z.string().uuid().optional(),
  secondary_user_id: z.string().uuid().optional(),
});

// Models
export enum UserType {
  COUPLE = "COUPLE",
}

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  password: z.string(),
  email_verified: z.string().optional(),
  image: z.string().optional(),
  role: z.nativeEnum(UserType).default(UserType.COUPLE),
  is_onboarded: z.boolean().default(false),
  has_pybank_account: z.boolean().default(false),
  onboarding_step: z.string().default("1"),
  is_magic_link_login: z.boolean().default(false),
});

export const AccountSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  provider: z.string(),
  provider_account_id: z.string(),
  refresh_token: z.string().optional(),
  access_token: z.string().optional(),
  expires_at: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
  session_state: z.string().optional(),
  user_id: z.string().uuid(),
});

export const UserAccountSchema = z.object({
  acocunt_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  session_token: z.string().min(1).max(255),
  user_id: z.string().uuid(),
  expires: z.date(),
});

export const UserSessionSchema = z.object({
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
});

export const EventSchema = BaseEventSchema.extend({
  id: z.string().uuid(),
}).refine((data) => data.primary_user_id || data.secondary_user_id, {
  message:
    "At least one user must be specified (either primary_user_id or secondary_user_id)",
});

export const WishListSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1).optional(),
  total_gifts: z.string().default("0"),
  total_price: z.string().default("0"),
  event_id: z.string().uuid(),
});

export const GiftlistSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().min(1).optional(),
  total_gifts: z.string().default("0"),
  total_price: z.string().default("0"),
  is_default: z.boolean().default(false).optional(),
  category_id: z.string().optional(),
  event_id: z.string().uuid(),
});

export const GiftSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.string(),
  image_url: z.string().optional(),
  is_default: z.boolean().default(false).optional(),
  category_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  giftlist_id: z.string().uuid().optional(),
  source_gift_id: z.string().uuid().optional(),
  wishlist_id: z.string().uuid().optional(),
});

export const WishlistGiftSchema = z.object({
  wishlist_id: z.string().uuid(),
  gift_id: z.string().uuid(),
});

// Post Schemas for form
export const GiftPostSchema = GiftSchema.omit({ id: true });
export const GiftlistPostSchema = GiftlistSchema.omit({ id: true });
export const EventPostSchema = BaseEventSchema.refine(
  (data) => data.primary_user_id || data.secondary_user_id,
  {
    message:
      "At least one user must be specified (either primary_user_id or secondary_user_id)",
  },
);
export const WishlistPostSchema = WishListSchema.omit({ id: true }).extend({
  giftIds: z.array(z.string().uuid()),
});
export const CategoryPostSchema = CategorySchema.omit({ id: true });

// Query Params Schemas form queryies in url
export const PaginationQueryParamsSchema = z.object({
  itemsPerPage: z.number().int().positive().default(10).optional(),
  page: z.number().int().positive().default(1).optional(),
});

// Cretea a nother which is get the wishlist gifts where it is not optional the wishlist
export const GiftsQueryParamsSchema = PaginationQueryParamsSchema.extend({
  is_default: z.boolean().default(true).optional(),
  giftlist_id: z.string().optional(),
  event_id: z.string().uuid(),
  category_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
});

export const GiftslistQueryParamsSchema = PaginationQueryParamsSchema.extend({
  is_default: z.boolean().default(true).optional(),
  category_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
});

export const EventQueryParamsSchema = z.object({
  primary_user_id: z.boolean().default(true).optional(),
  secondary_user_id: z.boolean().default(true).optional(),
});

export const WishlistQueryParamsSchema = z.object({
  event_id: z.string().uuid().optional(),
});

export const WishlistGiftsQueryParamsSchema =
  PaginationQueryParamsSchema.extend({
    wishlist_id: z.string().uuid(),
    event_id: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
  });

// Path Params Schemas
export const GiftsPathParamsSchema = z.object({
  id: z.string().min(1).max(255),
});

export const GiftslistPathParamsSchema = z.object({
  id: z.string().min(1).max(255),
});

export const WishlistPathParamsSchema = z.object({
  id: z.string().min(1).max(255),
});

export const EventPathParamsSchema = z.object({
  id: z.string().min(1).max(255),
});

export const CategoryPathParamsSchema = z.object({
  id: z.string().min(1).max(255),
});
