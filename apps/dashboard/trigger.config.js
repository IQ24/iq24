"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v3_1 = require("@trigger.dev/sdk/v3");
exports.default = (0, v3_1.defineConfig)({
    project: process.env.TRIGGER_PROJECT_ID,
    runtime: "node",
    logLevel: "log",
    maxDuration: 900, // 15 minutes
    retries: {
        enabledInDev: false,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },
    build: {
        external: ["sharp"],
    },
    dirs: ["./jobs/tasks"],
});
