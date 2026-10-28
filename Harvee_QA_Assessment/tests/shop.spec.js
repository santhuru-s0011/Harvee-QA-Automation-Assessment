const { test, expect } = require('@playwright/test');
const { ShopPage } = require('../pages/ShopPage');
const USER = 'standard_user';
const PASS = 'secret_sauce'; // public demo credentials only
const A = 'Sauce Labs Backpack';
const B = 'Sauce Labs Bike Light';

test('TC01 standard user login', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login(USER, PASS);
  await shop.assertInventory();
});

test('TC03 locked-out user is rejected', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login('locked_out_user', PASS);
  await expect(page.locator('[data-test="error"]')).toContainText('locked out');
  await expect(page).not.toHaveURL(/inventory\.html/);
});

test('TC06 sort prices low to high, checking full list', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.sort('lohi');
  const prices = await shop.prices();
  expect(prices.length).toBeGreaterThan(1);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

test('TC07 sort prices high to low, checking full list', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.sort('hilo');
  const prices = await shop.prices();
  expect(prices.length).toBeGreaterThan(1);
  expect(prices).toEqual([...prices].sort((a, b) => b - a));
});

test('TC08 sort names A to Z, checking full list', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.sort('az');
  const names = await shop.names();
  expect(names.length).toBeGreaterThan(1);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
});

test('TC09 sort names Z to A, checking full list', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.sort('za');
  const names = await shop.names();
  expect(names.length).toBeGreaterThan(1);
  expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
});

test('TC10 add two products and remove one on cart page', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.addProduct(A);
  await shop.addProduct(B);
  await expect(shop.cartBadge).toHaveText('2');
  await shop.openCart();
  expect(await shop.cartItemNames()).toEqual(expect.arrayContaining([A, B]));
  await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();
  await expect(shop.cartBadge).toHaveText('1');
  expect(await shop.cartItemNames()).toEqual([A]);
});

test('TC11 remove product from inventory, badge and cart update', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.addProduct(A);
  await expect(shop.cartBadge).toHaveText('1');
  await shop.removeProduct(A);
  await expect(shop.cartBadge).toHaveCount(0);
  await shop.openCart();
  await expect(page.locator('[data-test="cart-item"]')).toHaveCount(0);
});

test('TC14 checkout totals and complete order', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.addProduct(A);
  await shop.addProduct(B);
  await shop.openCart();
  await shop.checkout();
  await expect(page).toHaveURL(/checkout-step-two\.html/);
  const itemPrices = await page.locator('[data-test="inventory-item-price"]').allTextContents();
  const subtotal = itemPrices.reduce((s, x) => s + Number(x.replace('$', '')), 0);
  const displayedSubtotal = Number((await page.locator('[data-test="subtotal-label"]').innerText()).match(/\$([\d.]+)/)[1]);
  const tax = Number((await page.locator('[data-test="tax-label"]').innerText()).match(/\$([\d.]+)/)[1]);
  const total = Number((await page.locator('[data-test="total-label"]').innerText()).match(/\$([\d.]+)/)[1]);
  expect(displayedSubtotal).toBeCloseTo(subtotal, 2);
  expect(total).toBeCloseTo(subtotal + tax, 2);
  await page.locator('[data-test="finish"]').click();
  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(page.locator('[data-test="complete-header"]')).toContainText('Thank you for your order');
  await expect(shop.cartBadge).toHaveCount(0);
  await shop.openCart();
  await expect(page.locator('[data-test="cart-item"]')).toHaveCount(0);
});

test('TC15 missing checkout first name shows validation', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.addProduct(A);
  await shop.openCart();
  await shop.checkout('', 'Customer', '600001');
  await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
});

test('TC16 cancel checkout returns to cart with item retained', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await shop.addProduct(A);
  await shop.openCart();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="cancel"]').click();
  await expect(page).toHaveURL(/cart\.html/);
  expect(await shop.cartItemNames()).toContain(A);
});

test('TC18 logout blocks inventory on return navigation', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.login();
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#logout_sidebar_link').click();
  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  await page.goto('/inventory.html');
  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
});
