import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductSnapshot {
  name: string;
  price: number;
}

export class ProductPage extends BasePage {
  private readonly name = this.byTestId('product-name');
  private readonly unitPrice = this.byTestId('unit-price');
  private readonly addToCartButton = this.byTestId('add-to-cart');
  private readonly quantity = this.byTestId('quantity');
  private readonly increaseQuantity = this.byTestId('increase-quantity');

  /** Toast shown after adding to cart. */
  get addedToast(): Locator {
    return this.page.getByRole('alert').filter({ hasText: /added/i });
  }

  async open(productId: string) {
    await this.page.goto(`/product/${productId}`);
  }

  async snapshot(): Promise<ProductSnapshot> {
    const name = (await this.name.textContent())?.trim() ?? '';
    const priceText = (await this.unitPrice.textContent()) ?? '';
    return { name, price: Number(priceText.replace(/[^0-9.]/g, '')) };
  }

  async setQuantity(qty: number) {
    await this.quantity.fill(String(qty));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}
