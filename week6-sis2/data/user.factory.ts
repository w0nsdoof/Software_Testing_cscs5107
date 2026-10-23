import { randomUUID } from 'node:crypto';

export interface User {
  firstName: string;
  lastName: string;
  dob: string;          // yyyy-mm-dd
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;      // ISO code used by the Toolshop <select>
  phone: string;
  email: string;
  password: string;
}

/** A fresh customer for every run. The suffix keeps parallel runs and repeated runs from colliding. */
export function newUser(overrides: Partial<User> = {}): User {
  const suffix = `${Date.now().toString(36)}${randomUUID().slice(0, 6)}`;
  return {
    firstName: 'Askar',
    lastName: `Test${suffix.slice(-4)}`,
    dob: '1999-05-14',
    street: 'Tole bi',
    houseNumber: '59',
    postalCode: '050000',
    city: 'Almaty',
    state: 'Almaty',
    country: 'KZ',
    phone: '7771234567',
    email: `sis2.${suffix}@example.com`,
    password: 'Sis2!Pass2026',
    ...overrides,
  };
}
