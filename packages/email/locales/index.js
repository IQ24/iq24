"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getI18n = getI18n;
const translations_1 = require("./translations");
const supportedLocales = ["en", "sv"];
function getI18n({ locale = "en" }) {
    // Ensure locale is supported, fallback to English if not
    const safeLocale = supportedLocales.includes(locale) ? locale : "en";
    // Get translations for the locale
    const getTranslation = (key, params) => {
        const translationSet = (0, translations_1.translations)(safeLocale, params);
        if (!translationSet || !(key in translationSet)) {
            return key; // Fallback to key if translation missing
        }
        return translationSet[key];
    };
    return {
        t: getTranslation,
    };
}
