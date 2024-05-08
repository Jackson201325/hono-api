import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import supabase from '../db/client'
import { CategoryPathParamsSchema, CategoryPostSchema } from '../schemas'

export const categoriesRoute = new Hono()

// Create a category
categoriesRoute.post('/', zValidator('json', CategoryPostSchema), async c => {
  const category = c.req.valid('json')
  const { data, error } = await supabase.from('categories').insert(category)
  if (error) {
    c.status(500)
    return c.json({ error: 'Failed to create category' })
  }
  c.status(201)
  return c.json(data)
})

// Get all categories
categoriesRoute.get('/', async c => {
  const { data, error } = await supabase.from('categories').select()
  if (error) {
    c.status(500)
    return c.json({ error: 'Failed to fetch categories' })
  }
  c.status(200)
  return c.json(data)
})

// Get a single category by ID
categoriesRoute.get(
  '/:id',
  zValidator('param', CategoryPathParamsSchema),
  async c => {
    const { id } = c.req.valid('param')
    const { data, error } = await supabase
      .from('categories')
      .select()
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      c.status(404)
      return c.json({ error: 'Category not found' })
    }
    c.status(200)
    return c.json(data)
  },
)

// Update a category by ID
categoriesRoute.put(
  '/:id',
  zValidator('param', CategoryPathParamsSchema),
  zValidator('json', CategoryPostSchema),
  async c => {
    const { id } = c.req.valid('param')
    const categoryUpdates = c.req.valid('json')
    const { data, error } = await supabase
      .from('categories')
      .update(categoryUpdates)
      .eq('id', id)

    if (error) {
      c.status(500)
      return c.json({ error: 'Failed to update category' })
    }
    c.status(200)
    return c.json(data)
  },
)

// Delete a category by ID
categoriesRoute.delete(
  '/:id',
  zValidator('param', CategoryPathParamsSchema),
  async c => {
    const { id } = c.req.valid('param')
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      c.status(500)
      return c.json({ error: 'Failed to delete category' })
    }
    c.status(204)
    return c.json({ message: 'Category deleted successfully' })
  },
)

export default categoriesRoute
