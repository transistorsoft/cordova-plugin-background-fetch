var plugin = function () {
    return window.BackgroundFetch;
};
var BackgroundFetch = /** @class */ (function () {
    function BackgroundFetch() {
    }
    Object.defineProperty(BackgroundFetch, "STATUS_RESTRICTED", {
        get: function () { return plugin().STATUS_RESTRICTED; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "STATUS_DENIED", {
        get: function () { return plugin().STATUS_DENIED; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "STATUS_AVAILABLE", {
        get: function () { return plugin().STATUS_AVAILABLE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "FETCH_RESULT_NEW_DATA", {
        get: function () { return plugin().FETCH_RESULT_NEW_DATA; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "FETCH_RESULT_NO_DATA", {
        get: function () { return plugin().FETCH_RESULT_NO_DATA; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "FETCH_RESULT_FAILED", {
        get: function () { return plugin().FETCH_RESULT_FAILED; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_NONE", {
        get: function () { return plugin().NETWORK_TYPE_NONE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_ANY", {
        get: function () { return plugin().NETWORK_TYPE_ANY; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_UNMETERED", {
        get: function () { return plugin().NETWORK_TYPE_UNMETERED; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_NOT_ROAMING", {
        get: function () { return plugin().NETWORK_TYPE_NOT_ROAMING; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundFetch, "NETWORK_TYPE_CELLULAR", {
        get: function () { return plugin().NETWORK_TYPE_CELLULAR; },
        enumerable: true,
        configurable: true
    });
    BackgroundFetch.configure = function () {
        var fetch = plugin();
        return fetch.configure.apply(fetch, arguments);
    };
    BackgroundFetch.finish = function () {
        var fetch = plugin();
        return fetch.finish.apply(fetch, arguments);
    };
    BackgroundFetch.start = function () {
        var fetch = plugin();
        return fetch.start.apply(fetch, arguments);
    };
    BackgroundFetch.stop = function () {
        var fetch = plugin();
        return fetch.stop.apply(fetch, arguments);
    };
    BackgroundFetch.status = function () {
        var fetch = plugin();
        return fetch.status.apply(fetch, arguments);
    };
    return BackgroundFetch;
}());
export default BackgroundFetch;
