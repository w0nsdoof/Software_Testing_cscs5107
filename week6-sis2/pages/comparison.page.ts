import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ComparisonPage extends BasePage {
  private readonly table = this.byTestId('comparison-table');

  /** Product names in the table header, in the order they were added. */
  get productNames(): Locator {
    return this.table.getByTestId('product-name');
  }

  /** The price row, one cell per product. */
  get prices(): Locator {
    return this.byTestId('compare-price');
  }
}
