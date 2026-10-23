import { test, expect } from '../fixtures';

test.describe('TC-04 Compare two products', () => {
  test('the comparison page shows both products with their catalogue prices', async ({ api, productPage, comparisonPage, page }) => {
    const products = await api.inStockProducts(2);
    expect(products.length, 'need two in-stock products').toBeGreaterThanOrEqual(2);
    const [a, b] = products;

    await productPage.open(a.id);
    const first = await productPage.snapshot();
    await productPage.addToCompare();

    await productPage.open(b.id);
    const second = await productPage.snapshot();
    await productPage.addToCompare();
    // the bar only appears once two products are selected
    await expect(productPage.comparisonBar).toContainText('2 product(s) selected');

    // the product pages agree with the catalogue
    expect(first.name).not.toBe(second.name);
    expect([first.name, second.name]).toEqual([a.name, b.name]);
    expect(first.price).toBeCloseTo(a.price, 2);
    expect(second.price).toBeCloseTo(b.price, 2);

    await productPage.openComparison();
    await expect(page).toHaveURL(/\/comparison/);
    await expect(comparisonPage.productNames).toHaveText([a.name, b.name]);
    await expect(comparisonPage.prices).toHaveText([`$${a.price.toFixed(2)}`, `$${b.price.toFixed(2)}`]);
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
