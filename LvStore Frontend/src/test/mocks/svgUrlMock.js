"use strict";

/**
 * Jest не резолвить Vite-імпорти `*.svg?url` (інакше ENOENT на `file.svg?url`).
 * Повертаємо стабільний рядок — для тестів достатньо валідного «URL» у `src` img.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = "/__jest__/mock-asset.svg";
