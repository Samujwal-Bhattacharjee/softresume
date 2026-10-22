import "@testing-library/jest-dom/vitest";

// Mock ResizeObserver for test environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock crypto.randomUUID if not present
if (!global.crypto?.randomUUID) {
  let counter = 0;
  global.crypto = {
    ...global.crypto,
    randomUUID: (() => `00000000-0000-0000-0000-${String(++counter).padStart(12, "0")}`) as unknown as Crypto["randomUUID"],
  };
}
