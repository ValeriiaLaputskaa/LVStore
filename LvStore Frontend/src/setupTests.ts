import "@testing-library/jest-dom";
import structuredClonePolyfill from "@ungap/structured-clone";
import { TextDecoder, TextEncoder } from "util";

Object.assign(globalThis, { TextDecoder, TextEncoder });

if (typeof globalThis.structuredClone !== "function") {
  globalThis.structuredClone =
    structuredClonePolyfill as typeof globalThis.structuredClone;
}
