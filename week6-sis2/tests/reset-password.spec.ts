import { test, expect } from '../fixtures';

/**
 * The hosted Toolshop cannot show the reset e-mail, so this test is scoped to
 * the observable UI outcome of the forgot-password flow.
 */
test.describe('TC-05 Reset a password', () => {
  test('a known email gets a confirmation message', async ({ forgotPasswordPage, customer }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(customer.email);

    await expect(forgotPasswordPage.alert).toBeVisible();
    await expect(forgotPasswordPage.alert).toContainText(/sent|success|mail/i);
  });

  test('an invalid email is rejected with an error', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset('not-an-email');

    await expect(forgotPasswordPage.emailValidationError.or(forgotPasswordPage.alert)).toBeVisible();
    await expect(page).toHaveURL(/forgot-password/);
  });
});
