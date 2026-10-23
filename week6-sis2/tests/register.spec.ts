import { test, expect } from '../fixtures';
import { newUser } from '../data/user.factory';

test.describe('TC-01 Register a new customer', () => {
  test('a new customer can register and then sign in with the same credentials', async ({ registerPage, loginPage, page }) => {
    const user = newUser();

    await registerPage.open();
    await registerPage.register(user);

    // Registration hands the user to the login page
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(registerPage.registerError).toBeHidden();

    // The account exists: the same credentials open the account area
    await loginPage.signIn(user.email, user.password);
    await expect(page).toHaveURL(/\/account/);
    await loginPage.expectSignedInAs(user.firstName, user.lastName);
  });

  test('registering with an email that already exists is rejected', async ({ registerPage, page }) => {
    const user = newUser({ email: 'customer@practicesoftwaretesting.com' });

    await registerPage.open();
    await registerPage.register(user);

    await expect(registerPage.registerError).toBeVisible();
    await expect(registerPage.registerError).toContainText(/already exists/i);
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
