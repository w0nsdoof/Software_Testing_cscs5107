import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected byTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  /** The cart badge in the navigation bar. Hidden when the cart is empty. */
  get cartBadge(): Locator {
    return this.byTestId('cart-quantity');
  }

  get pageTitle(): Locator {
    return this.byTestId('page-title');
  }

  /** The navigation entry that shows the signed-in customer's name. */
  get navUserMenu(): Locator {
    return this.byTestId('nav-menu');
  }

  async expectSignedInAs(firstName: string, lastName: string) {
    await expect(this.navUserMenu).toContainText(`${firstName} ${lastName}`);
  }

  async openCart() {
    await this.byTestId('nav-cart').click();
  }
}
