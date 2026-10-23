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
    // Not /invoice/: the signed-in user menu holds a hidden "My invoices" link.
    return this.page.getByText(/thanks for your order/i);
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

  /**
   * Step 3: the profile prefill arrives asynchronously, so checking for empty
   * fields races it; set every field to the expected address instead.
   * Entering a postcode triggers a lookup that overwrites street, city and state
   * with a made-up address the invoice API then rejects for the country, so
   * those three are filled only after the lookup has answered.
   */
  async confirmAddress(address: { street: string; houseNumber: string; city: string; state: string; country: string; postalCode: string }) {
    const lookup = this.page.waitForResponse((r) => r.url().includes('/postcode-lookup'));
    await this.byTestId('country').selectOption(address.country);
    await this.byTestId('postal_code').fill(address.postalCode);
    await this.byTestId('house_number').fill(address.houseNumber);
    await lookup;
    const fields: Array<[string, string]> = [
      ['street', address.street],
      ['city', address.city],
      ['state', address.state],
    ];
    for (const [id, value] of fields) {
      await this.byTestId(id).fill(value);
    }
    await this.proceedFromAddress.click();
  }

  /** Step 4: pay with the simplest method. */
  async payWith(method: string) {
    await this.paymentMethod.selectOption(method);
    await this.finish.click();
  }

  /** After the payment is accepted the same button places the order. */
  async confirmOrder() {
    await this.finish.click();
  }
}
