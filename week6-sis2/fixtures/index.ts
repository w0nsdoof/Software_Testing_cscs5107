import { mergeTests } from '@playwright/test';
import { test as pagesTest } from './pages.fixture';
import { test as apiTest } from './api.fixture';

/** One `test` with both the page-object fixtures and the API helper. */
export const test = mergeTests(pagesTest, apiTest);
export { expect } from '@playwright/test';
