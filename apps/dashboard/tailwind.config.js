"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tailwind_config_1 = __importDefault(require("@iq24/ui/tailwind.config"));
exports.default = {
    content: [
        "./src/**/*.{ts,tsx}",
        "../../packages/ui/src/**/*.{ts,tsx}",
        "../../packages/invoice/src/**/*.{ts,tsx}",
    ],
    presets: [tailwind_config_1.default],
    plugins: [require("@todesktop/tailwind-variants")],
};
