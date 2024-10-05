/* eslint-disable @typescript-eslint/no-explicit-any */

export {};

declare global {
  interface Window {
    aptos: any; // This line will allow 'any' without throwing ESLint errors
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */
