
const { expect } = require('@playwright/test');

class ShopPage {
  constructor(page) {
    this.page = page;

    this.inventory = page.locator(
      '[data-test="inventory-container"]'
    );

    this.cartBadge = page.locator(
      '[data-test="shopping-cart-badge"]'
    );

    this.cartLink = page.locator(
      '[data-test="shopping-cart-link"]'
    );
  }

  // Login functionality
  async login(
    username = 'standard_user',
    password = 'secret_sauce'
  ) {
    await this.page.goto('/');

    await this.page
      .locator('[data-test="username"]')
      .fill(username);

    await this.page
      .locator('[data-test="password"]')
      .fill(password);

    await this.page
      .locator('[data-test="login-button"]')
      .click();
  }

  // Verify inventory page
  async assertInventory() {
    await expect(this.page).toHaveURL(/inventory\.html/);

    await expect(this.inventory).toBeVisible();
  }

  // Sort products
  async sort(option) {
    await this.page
      .locator('[data-test="product-sort-container"]')
      .selectOption(option);
  }

  // Get product prices
  async prices() {
    const priceTexts = await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();

    return priceTexts.map(price =>
      Number(price.replace('$', '').trim())
    );
  }

  // Get product names
  async names() {
    return await this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  // Add product to cart
  async addProduct(name) {
    const item = this.page
      .locator('[data-test="inventory-item"]')
      .filter({
        has: this.page.locator(
          '[data-test="inventory-item-name"]',
          { hasText: name }
        )
      });

    await item
      .getByRole('button', { name: 'Add to cart' })
      .click();
  }

  // Remove product from cart
  async removeProduct(name) {
    const item = this.page
      .locator('[data-test="inventory-item"]')
      .filter({
        has: this.page.locator(
          '[data-test="inventory-item-name"]',
          { hasText: name }
        )
      });

    await item
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  // Open shopping cart
  async openCart() {
    await this.cartLink.click();
  }

  // Get cart item names
  async cartItemNames() {
    return await this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  // Checkout functionality
  async checkout(
    first = 'Test',
    last = 'Customer',
    postal = '600001'
  ) {
    await this.page
      .locator('[data-test="checkout"]')
      .click();

    await this.page
      .locator('[data-test="firstName"]')
      .fill(first);

    await this.page
      .locator('[data-test="lastName"]')
      .fill(last);

    await this.page
      .locator('[data-test="postalCode"]')
      .fill(postal);

    await this.page
      .locator('[data-test="continue"]')
      .click();
  }
}

module.exports = { ShopPage };
