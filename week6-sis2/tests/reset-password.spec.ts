import { test, expect } from '../fixtures';

/**
 * The hosted Toolshop cannot show the reset e-mail, so this test checks what
 * the site itself shows: the message, and that the old password stops working.
 */
test.describe('TC-05 Reset a password', () => {
  test('a known email gets a confirmation and the old password stops working', async ({ forgotPasswordPage, loginPage, customer, page }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(customer.email);

    await expect(forgotPasswordPage.alert).toBeVisible();
    // The live site renders the untranslated i18n key as the confirmation text.
    await expect(forgotPasswordPage.alert).toHaveText('page.forgot-password.confirm');

    await loginPage.open();
    await loginPage.signIn(customer.email, customer.password);
    await expect(loginPage.loginError).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('an unregistered email is rejected', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(`nobody.${Date.now()}@example.com`);

    await expect(forgotPasswordPage.alert).toHaveText(/the selected email is invalid/i);
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('an invalid email is rejected with an error', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset('not-an-email');

    await expect(forgotPasswordPage.emailValidationError.or(forgotPasswordPage.alert)).toBeVisible();
    await expect(page).toHaveURL(/forgot-password/);
  });
});
