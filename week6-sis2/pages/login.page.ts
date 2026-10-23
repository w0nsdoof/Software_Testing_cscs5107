import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly email = this.byTestId('email');
  private readonly password = this.byTestId('password');
  private readonly submit = this.byTestId('login-submit');

  /** Error shown under the form when credentials are rejected. */
  get loginError(): Locator {
    return this.byTestId('login-error');
  }

  async open() {
    await this.page.goto('/auth/login');
  }

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
