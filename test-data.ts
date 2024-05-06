import { faker, simpleFaker } from "@faker-js/faker";
import type { z } from "zod";
import { CategorySchema, GiftSchema } from "./schemas";

const generateSeedData = (numCategories = 5) => {
  const categories: z.infer<typeof CategorySchema>[] = [];
  const gifts: z.infer<typeof GiftSchema>[] = [];

  for (const _ of Array.from({ length: numCategories })) {
    const validatedCategory = CategorySchema.safeParse({
      id: simpleFaker.string.uuid(),
      name: faker.commerce.department(),
    });

    if (validatedCategory.success) {
      categories.push(validatedCategory.data);

      for (const _ of Array.from({ length: 10 })) {
        const gift = {
          id: simpleFaker.string.uuid(),
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(),
          is_default: faker.datatype.boolean(),
          category_id: validatedCategory.data.id,
        };

        const validatedGift = GiftSchema.safeParse(gift);
        if (validatedGift.success) {
          gifts.push(validatedGift.data);
        }
      }
    }
  }

  return { categories, gifts };
};

export const { categories, gifts } = generateSeedData(5);
