import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  /** One row per product in the cart table. */
  get lineItems(): Locator {
    return this.page.locator('tbody tr');
  }

  get productTitles(): Locator {
    return this.byTestId('product-title');
  }

  get quantities(): Locator {
    return this.byTestId('product-quantity');
  }

  get linePrices(): Locator {
    return this.byTestId('product-price');
  }

  get lineTotals(): Locator {
    return this.byTestId('line-price');
  }

  get cartTotal(): Locator {
    return this.byTestId('cart-total');
  }

  async open() {
    await this.page.goto('/checkout');
  }
}
