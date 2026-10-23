import { test as base, APIRequestContext } from '@playwright/test';

const API = 'https://api.practicesoftwaretesting.com';

export interface CatalogueProduct {
  id: string;
  name: string;
  price: number;
  in_stock: boolean | number;
}

/**
 * Reads product data through the public REST API so tests do not depend on
 * the catalogue order or on which products are in stock today.
 */
export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  async inStockProducts(minimum = 2): Promise<CatalogueProduct[]> {
    const products: CatalogueProduct[] = [];
    for (let pageNo = 1; pageNo <= 5 && products.length < minimum + 3; pageNo++) {
      const res = await this.request.get(`${API}/products?page=${pageNo}`);
      if (!res.ok()) break;
      const body = await res.json();
      for (const p of body.data ?? []) {
        if (p.in_stock) products.push({ id: p.id, name: p.name, price: Number(p.price), in_stock: p.in_stock });
      }
      if (!body.data?.length) break;
    }
    return products;
  }
}

export const test = base.extend<{ api: ToolshopApi }>({
  api: async ({ request }, use) => { await use(new ToolshopApi(request)); },
});
