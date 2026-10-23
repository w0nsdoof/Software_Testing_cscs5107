import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * The Toolshop checkout is a 4-step wizard on /checkout:
 * 1 cart -> 2 sign in -> 3 billing address -> 4 payment.
 */
export class CheckoutPage extends BasePage {
  private readonly proceedFromCart = this.byTestId('proceed-1');
  private readonly proceedFromSignIn = this.byTestId('proceed-2');
  private readonly proceedFromAddress = this.byTestId('proceed-3');
  private readonly paymentMethod = this.byTestId('payment-method');
  private readonly finish = this.byTestId('finish');

  private readonly loginEmail = this.byTestId('email');
  private readonly loginPassword = this.byTestId('password');
  private readonly loginSubmit = this.byTestId('login-submit');

  get paymentSuccessMessage(): Locator {
    return this.byTestId('payment-success-message');
  }

  get orderConfirmation(): Locator {
    return this.page.getByText(/thanks for your order|order was placed|invoice/i).first();
  }

  async open() {
    await this.page.goto('/checkout');
  }

  async continueFromCart() {
    await this.proceedFromCart.click();
  }

  /** Step 2: either already signed in (button enabled) or sign in inline. */
  async signInIfNeeded(email: string, password: string) {
    if (await this.loginEmail.isVisible()) {
      await this.loginEmail.fill(email);
      await this.loginPassword.fill(password);
      await this.loginSubmit.click();
    }
    await this.proceedFromSignIn.click();
  }

  /** Step 3: the address is prefilled from the profile; fill anything empty. */
  async confirmAddress(address: { street: string; city: string; state: string; country: string; postalCode: string }) {
    const fields: Array<[string, string]> = [
      ['street', address.street],
      ['city', address.city],
      ['state', address.state],
      ['country', address.country],
      ['postal_code', address.postalCode],
    ];
    for (const [id, value] of fields) {
      const field = this.byTestId(id);
      if ((await field.count()) && !(await field.inputValue())) {
        await field.fill(value);
      }
    }
    await this.proceedFromAddress.click();
  }

  /** Step 4: pay with the simplest method. */
  async payWith(method: string) {
    await this.paymentMethod.selectOption(method);
    await this.finish.click();
  }
}
