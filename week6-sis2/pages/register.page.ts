import { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { User } from '../data/user.factory';

export class RegisterPage extends BasePage {
  private readonly firstName = this.byTestId('first-name');
  private readonly lastName = this.byTestId('last-name');
  private readonly dob = this.byTestId('dob');
  private readonly street = this.byTestId('street');
  private readonly postalCode = this.byTestId('postal_code');
  private readonly houseNumber = this.byTestId('house_number');
  private readonly city = this.byTestId('city');
  private readonly state = this.byTestId('state');
  private readonly country = this.byTestId('country');
  private readonly phone = this.byTestId('phone');
  private readonly email = this.byTestId('email');
  private readonly password = this.byTestId('password');
  private readonly submit = this.byTestId('register-submit');

  get registerError(): Locator {
    return this.byTestId('register-error');
  }

  async open() {
    await this.page.goto('/auth/register');
  }

  async register(user: User) {
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.dob.fill(user.dob);
    await this.street.fill(user.street);
    await this.postalCode.fill(user.postalCode);
    await this.houseNumber.fill(user.houseNumber);
    await this.city.fill(user.city);
    await this.state.fill(user.state);
    await this.country.selectOption(user.country);
    await this.phone.fill(user.phone);
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.submit.click();
  }
}
