import { test, expect } from '../fixtures';

/**
 * The Toolshop has no built-in "compare" feature, so this test performs the
 * comparison itself: it opens two products, records name and price from the
 * UI, and asserts the stated relationships, including against the API.
 */
test.describe('TC-04 Compare two products', () => {
  test('two product pages show distinct names and prices consistent with the catalogue', async ({ api, productPage }) => {
    const products = await api.inStockProducts(2);
    expect(products.length, 'need two in-stock products').toBeGreaterThanOrEqual(2);
    const [a, b] = products;

    await productPage.open(a.id);
    const first = await productPage.snapshot();

    await productPage.open(b.id);
    const second = await productPage.snapshot();

    // the two pages describe two different products
    expect(first.name).not.toBe(second.name);
    expect(first.name).toBe(a.name);
    expect(second.name).toBe(b.name);

    // the prices shown in the UI match the catalogue
    expect(first.price).toBeCloseTo(a.price, 2);
    expect(second.price).toBeCloseTo(b.price, 2);
    expect(first.price).toBeGreaterThan(0);
    expect(second.price).toBeGreaterThan(0);

    // the comparison the test states: the cheaper one is the one the catalogue says is cheaper
    const cheaperInUi = first.price <= second.price ? first.name : second.name;
    const cheaperInApi = a.price <= b.price ? a.name : b.name;
    expect(cheaperInUi).toBe(cheaperInApi);
  });

  test('adding two different products gives a cart with two lines and the summed total', async ({ api, productPage, cartPage }) => {
    const [a, b] = await api.inStockProducts(2);

    await productPage.open(a.id);
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText('1');

    await productPage.open(b.id);
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText('2');

    await cartPage.open();
    await expect(cartPage.lineItems).toHaveCount(2);
    await expect(cartPage.productTitles).toContainText([a.name, b.name]);
    await expect(cartPage.cartTotal).toContainText((a.price + b.price).toFixed(2));
  });
});
