import { test as base, APIRequestContext } from '@playwright/test';
import { newUser, User } from '../data/user.factory';

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

  async registerCustomer(user: User): Promise<void> {
    const res = await this.request.post(`${API}/users/register`, {
      data: {
        first_name: user.firstName,
        last_name: user.lastName,
        dob: user.dob,
        phone: user.phone,
        email: user.email,
        password: user.password,
        address: {
          street: user.street,
          house_number: user.houseNumber,
          city: user.city,
          state: user.state,
          country: user.country,
          postal_code: user.postalCode,
        },
      },
    });
    if (!res.ok()) throw new Error(`registering ${user.email} failed: ${res.status()} ${await res.text()}`);
  }
}

/**
 * `customer` is a fresh account registered through the API for this test only.
 * The shared seeded account gets locked by other people's failed logins.
 */
export const test = base.extend<{ api: ToolshopApi; customer: User }>({
  api: async ({ request }, use) => { await use(new ToolshopApi(request)); },
  customer: async ({ api }, use) => {
    const user = newUser();
    await api.registerCustomer(user);
    await use(user);
  },
});
