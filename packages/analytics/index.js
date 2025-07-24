"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = exports.EventTracker = exports.AnalyticsManager = void 0;
var analytics_manager_1 = require("./src/analytics-manager");
Object.defineProperty(exports, "AnalyticsManager", { enumerable: true, get: function () { return analytics_manager_1.AnalyticsManager; } });
var event_tracker_1 = require("./src/event-tracker");
Object.defineProperty(exports, "EventTracker", { enumerable: true, get: function () { return event_tracker_1.EventTracker; } });
var metrics_collector_1 = require("./src/metrics-collector");
Object.defineProperty(exports, "MetricsCollector", { enumerable: true, get: function () { return metrics_collector_1.MetricsCollector; } });
__exportStar(require("./src/analytics-types"), exports);
__exportStar(require("./src/analytics-config"), exports);
