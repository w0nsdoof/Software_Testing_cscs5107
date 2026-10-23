import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  private readonly email = this.byTestId('email');
  private readonly submit = this.byTestId('forgot-password-submit');

  /** Any alert rendered after submitting the form (success or failure). */
  get alert(): Locator {
    return this.page.getByRole('alert');
  }

  get emailValidationError(): Locator {
    return this.byTestId('email-error');
  }

  async open() {
    await this.page.goto('/auth/forgot-password');
  }

  async requestReset(email: string) {
    await this.email.fill(email);
    await this.submit.click();
  }
}
