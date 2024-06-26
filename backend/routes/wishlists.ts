import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import supabase from '../db/client'
import {
  WishlistGiftsQueryParamsSchema,
  WishlistPathParamsSchema,
  WishlistPostSchema,
  WishlistQueryParamsSchema,
} from '../schemas'

const wishlistsRoute = new Hono()

wishlistsRoute.get(
  '/gifts',
  zValidator('query', WishlistGiftsQueryParamsSchema),
  async c => {
    const { itemsPerPage, name, page, wishlist_id, event_id } =
      c.req.valid('query')

    const query = supabase.from('event_gifts').select()

    if (itemsPerPage !== undefined && page !== undefined) {
      query.range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
    }

    if (name) {
      query.ilike('name', `%${name}%`)
    }

    if (event_id) {
      query.eq('event_id', event_id)
    }

    if (wishlist_id) {
      query.eq('wishlist_id', wishlist_id)
    }

    const { data, error } = await query

    if (error) {
      c.status(500)
      return c.json({ error: 'Failed to fetch gifts' })
    }

    c.status(200)
    return c.json(data)
  },
)

// Add gifts to a wishlist by passing an array of gift IDs
wishlistsRoute.post(
  '/:id/gifts',
  zValidator('json', WishlistPostSchema),
  async c => {
    const wishlistId = c.req.param('id')
    const { giftIds, event_id } = c.req.valid('json')

    const giftsToAdd = giftIds.map(id => ({
      wishlist_id: wishlistId,
      gift_id: id,
      event_id: event_id,
    }))

    const { error } = await supabase.from('wishlist_gifts').insert(giftsToAdd)

    if (error) {
      c.status(500)
      return c.json({ error: 'Failed to add gifts to wishlist' })
    }

    c.status(201)
    return c.json({ message: 'Gifts added successfully' })
  },
)

wishlistsRoute.get(
  '/',
  zValidator('query', WishlistQueryParamsSchema),
  async c => {
    const { event_id } = c.req.valid('query')

    if (!event_id) {
      c.status(400)
      return c.json({ error: 'Missing event_id' })
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select()
      .eq('event_id', event_id)

    if (error) {
      c.status(500)
      return c.json({ error: 'Failed to fetch wishlists' })
    }

    if (data) {
      c.status(200)
      return c.json(data)
    }
  },
)

// Get a single wishlist by ID
wishlistsRoute.get(
  '/:id',
  zValidator('query', WishlistPathParamsSchema),
  async c => {
    const { id } = c.req.valid('query')

    const { data, error } = await supabase
      .from('wishlists')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      c.status(404)
      return c.json({ error: 'Wishlist not found' })
    }

    if (data) {
      c.status(200)
      return c.json(data)
    }
  },
)

export default wishlistsRoute
