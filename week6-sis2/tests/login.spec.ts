import { test, expect } from '../fixtures';

test.describe('TC-02 Log in', () => {
  test('valid credentials open the account page', async ({ loginPage, customer, page }) => {
    await loginPage.open();
    await loginPage.signIn(customer.email, customer.password);

    await expect(page).toHaveURL(/\/account/);
    await expect(loginPage.pageTitle).toHaveText(/my account/i);
    await loginPage.expectSignedInAs(customer.firstName, customer.lastName);
  });

  test('a wrong password shows an error and stays on the login page', async ({ loginPage, customer, page }) => {
    await loginPage.open();
    await loginPage.signIn(customer.email, 'definitely-wrong-password');

    await expect(loginPage.loginError).toBeVisible();
    await expect(loginPage.loginError).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(loginPage.navUserMenu).toBeHidden();
  });
});
