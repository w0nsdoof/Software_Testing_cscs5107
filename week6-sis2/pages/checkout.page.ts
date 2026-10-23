import { Locator, expect } from '@playwright/test';
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
   * Step 3: the form is prefilled from the customer's profile, and the prefilled
   * postcode and house number each trigger a /postcode-lookup that replaces
   * street, city and state with a made-up address. The invoice API accepts only
   * that looked-up address and rejects the real one, so the test waits for both
   * lookups to land instead of typing an address.
   */
  async confirmAddress(profile: { city: string }) {
    let lookups = 0;
    await this.page.waitForResponse((r) => r.url().includes('/postcode-lookup') && ++lookups === 2);
    await expect(this.byTestId('city')).not.toHaveValue(profile.city);
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
