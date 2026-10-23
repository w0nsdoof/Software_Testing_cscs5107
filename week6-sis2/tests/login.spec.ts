import { test, expect } from '../fixtures';
import { existingCustomer } from '../data/user.factory';

test.describe('TC-02 Log in', () => {
  test('valid credentials open the account page', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.signIn(existingCustomer.email, existingCustomer.password);

    await expect(page).toHaveURL(/\/account/);
    await expect(loginPage.pageTitle).toHaveText(/my account/i);
    await loginPage.expectSignedInAs(existingCustomer.firstName, existingCustomer.lastName);
  });

  test('a wrong password shows an error and stays on the login page', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.signIn(existingCustomer.email, 'definitely-wrong-password');

    await expect(loginPage.loginError).toBeVisible();
    await expect(loginPage.loginError).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(loginPage.navUserMenu).toBeHidden();
  });
});
