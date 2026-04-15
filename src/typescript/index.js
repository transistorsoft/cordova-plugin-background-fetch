var plugin = function () {
    return window.BackgroundFetch;
};
var BackgroundFetch = /** @class */ (function () {
    function BackgroundFetch() {
    }
    Object.defineProperty(BackgroundFetch, "STATUS_RESTRICTED", {
        // ── Status constants ──────────────────────────────────────────────
        get: function () { return plugin().STATUS_RESTRICTED; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "STATUS_DENIED", {
        get: function () { return plugin().STATUS_DENIED; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "STATUS_AVAILABLE", {
        get: function () { return plugin().STATUS_AVAILABLE; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "FETCH_RESULT_NEW_DATA", {
        // ── Deprecated fetch-result constants ─────────────────────────────
        /** @deprecated */
        get: function () { return plugin().FETCH_RESULT_NEW_DATA; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "FETCH_RESULT_NO_DATA", {
        /** @deprecated */
        get: function () { return plugin().FETCH_RESULT_NO_DATA; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "FETCH_RESULT_FAILED", {
        /** @deprecated */
        get: function () { return plugin().FETCH_RESULT_FAILED; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_NONE", {
        // ── Network type constants ────────────────────────────────────────
        get: function () { return plugin().NETWORK_TYPE_NONE; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_ANY", {
        get: function () { return plugin().NETWORK_TYPE_ANY; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_UNMETERED", {
        get: function () { return plugin().NETWORK_TYPE_UNMETERED; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_NOT_ROAMING", {
        get: function () { return plugin().NETWORK_TYPE_NOT_ROAMING; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_CELLULAR", {
        get: function () { return plugin().NETWORK_TYPE_CELLULAR; },
        enumerable: false,
        configurable: true
    });
    // ── Methods ───────────────────────────────────────────────────────
    BackgroundFetch.configure = function (config, onEvent, onTimeout) {
        return plugin().configure(config, onEvent, onTimeout);
    };
    BackgroundFetch.start = function (success, failure) {
        plugin().start(success, failure);
    };
    BackgroundFetch.stop = function (success, failure) {
        plugin().stop(success, failure);
    };
    BackgroundFetch.finish = function (taskId, success, failure) {
        plugin().finish(taskId, success, failure);
    };
    BackgroundFetch.scheduleTask = function (config, success, failure) {
        plugin().scheduleTask(config, success, failure);
    };
    BackgroundFetch.stopTask = function (taskId, success, failure) {
        plugin().stopTask(taskId, success, failure);
    };
    BackgroundFetch.status = function (callback) {
        plugin().status(callback);
    };
    return BackgroundFetch;
}());
export default BackgroundFetch;
