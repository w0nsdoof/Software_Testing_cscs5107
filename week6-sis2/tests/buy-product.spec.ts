import { test, expect } from '../fixtures';

test.describe('TC-03 Buy a product', () => {
  test('add to cart, cart shows the right item and quantity, checkout completes', async ({ api, customer, productPage, cartPage, checkoutPage, page }) => {
    const [product] = await api.inStockProducts(1);
    expect(product, 'the catalogue should have at least one in-stock product').toBeTruthy();

    // add to cart
    await productPage.open(product.id);
    const shown = await productPage.snapshot();
    expect(shown.name).toBe(product.name);
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText('1');

    // cart shows the right item, quantity and price
    await cartPage.open();
    await expect(cartPage.lineItems).toHaveCount(1);
    await expect(cartPage.productTitles.first()).toContainText(product.name);
    await expect(cartPage.quantities.first()).toHaveValue('1');
    await expect(cartPage.lineTotals.first()).toContainText(product.price.toFixed(2));
    await expect(cartPage.cartTotal).toContainText(product.price.toFixed(2));

    // checkout: sign in, confirm address, pay
    await checkoutPage.continueFromCart();
    await checkoutPage.signInIfNeeded(customer.email, customer.password);
    await checkoutPage.confirmAddress({ street: 'Tole bi 59', city: 'Almaty', state: 'Almaty', country: 'Kazakhstan', postalCode: '050000' });
    await checkoutPage.payWith('cash-on-delivery');

    await expect(checkoutPage.paymentSuccessMessage).toBeVisible();
    await expect(checkoutPage.paymentSuccessMessage).toContainText(/payment was successful/i);
    await expect(checkoutPage.orderConfirmation).toBeVisible();
    await expect(page).toHaveURL(/\/checkout/);
  });
});
