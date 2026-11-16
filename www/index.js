"use strict";
var exec = require('cordova/exec');
var MODULE = 'BackgroundFetch';
var EMPTY_FN = function () { };
var STATUS_RESTRICTED = 0;
var STATUS_DENIED = 1;
var STATUS_AVAILABLE = 2;
// (WO-009) One native call, as @transistorsoft/background-fetch-types declares it: a Promise settled by the native
// reply.  It resolves `value` applied to what native sends (the status for start and status; `true` for the others,
// which native answers with "OK" on Android and null on iOS, so the value is supplied here and never passed through)
// and rejects with what native sends.  The callbacks a caller passes get what native sends, as before.  A caller who
// passes a callback is answered there, so the Promise gets a no-op rejection handler: a callback-only caller never
// sees an unhandled rejection.  exec is called outside the Promise's executor, so a synchronous throw from it reaches
// the caller, as it did before.
function call(action, args, value, success, failure) {
    var settle = EMPTY_FN;
    var fail = EMPTY_FN;
    var promise = new Promise(function (resolve, reject) { settle = resolve; fail = reject; });
    if (typeof success === 'function' || typeof failure === 'function') {
        promise.catch(EMPTY_FN);
    }
    exec(function (answer) {
        settle(value(answer));
        if (typeof success === 'function') {
            success(answer);
        }
    }, function (error) {
        fail(error);
        if (typeof failure === 'function') {
            failure(error);
        }
    }, MODULE, action, args);
    return promise;
}
function asIs(value) { return value; }
function alwaysTrue() { return true; }
var BackgroundFetch = /** @class */ (function () {
    function BackgroundFetch() {
    }
    // ── Methods ───────────────────────────────────────────────────────
    BackgroundFetch.configure = function (config, onEvent, onTimeout) {
        if (typeof config !== 'object') {
            throw '[BackgroundFetch] configure error: the first argument to #configure is the Config {}';
        }
        if (typeof onEvent !== 'function') {
            throw '[BackgroundFetch] configure error: You must provide the fetch callback function as 2nd argument to #configure method';
        }
        if (typeof onTimeout !== 'function') {
            console.warn('[BackgroundFetch] configure: You did not provide a 3rd argument onTimeout callback. This callback is a signal from the OS that your allowed background time is about to expire. Use this callback to finish what you\'re doing and immediately call BackgroundFetch.finish(taskId)');
            onTimeout = function (taskId) {
                console.warn('[BackgroundFetch] default onTimeout callback fired. You should provide your own onTimeout callback to .configure(options, onEvent, onTimeout)');
                BackgroundFetch.finish(taskId);
            };
        }
        return new Promise(function (resolve, reject) {
            var onStatus = function (status) {
                if (status === STATUS_AVAILABLE) {
                    resolve(status);
                }
                else {
                    reject(status);
                }
            };
            exec(onEvent, onTimeout, MODULE, 'configure', [config]);
            exec(onStatus, onStatus, MODULE, 'status', []);
        });
    };
    // (WO-009) Resolves the status once the native start has run (both OSes reply after it), so `await start()` orders
    // it before a later stop().
    BackgroundFetch.start = function (success, failure) {
        return call('start', [], asIs, success, failure);
    };
    BackgroundFetch.stop = function (first, second, third) {
        if (typeof first === 'string') {
            return call('stop', [first], alwaysTrue, second, third);
        }
        if (typeof first === 'function') {
            return call('stop', [], alwaysTrue, first, second);
        }
        if (first !== undefined && first !== null) {
            throw '[BackgroundFetch] stop error: The 1st argument must be a taskId:String or a success callback';
        }
        // An empty first slot: the 7.x form, (success, failure) with no success, unless a third argument names the
        // failure.
        return third === undefined
            ? call('stop', [], alwaysTrue, undefined, second)
            : call('stop', [], alwaysTrue, second, third);
    };
    BackgroundFetch.finish = function (taskId, success, failure) {
        if (typeof taskId !== 'string') {
            throw '[BackgroundFetch] finish requires a String taskId as first argument';
        }
        exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'finish', [taskId]);
    };
    // (WO-009) Resolves true; rejects with native's error (iOS: the error's message).
    BackgroundFetch.scheduleTask = function (config, success, failure) {
        if (typeof config !== 'object') {
            throw '[BackgroundFetch] scheduleTask error: The 1st argument is a config {}';
        }
        return call('scheduleTask', [config], alwaysTrue, success, failure);
    };
    /** @deprecated Use {@link BackgroundFetch.stop}(taskId). (WO-009) */
    BackgroundFetch.stopTask = function (taskId, success, failure) {
        if (typeof taskId !== 'string') {
            throw '[BackgroundFetch] stopTask error: The 1st argument must be a taskId:String';
        }
        return call('stop', [taskId], alwaysTrue, success, failure);
    };
    // (WO-009) The callback is optional, as the types declare.
    BackgroundFetch.status = function (callback) {
        return call('status', [], asIs, callback);
    };
    // ── Status constants ──────────────────────────────────────────────
    BackgroundFetch.STATUS_RESTRICTED = STATUS_RESTRICTED;
    BackgroundFetch.STATUS_DENIED = STATUS_DENIED;
    BackgroundFetch.STATUS_AVAILABLE = STATUS_AVAILABLE;
    // ── Deprecated fetch-result constants ─────────────────────────────
    /** @deprecated */
    BackgroundFetch.FETCH_RESULT_NEW_DATA = 0;
    /** @deprecated */
    BackgroundFetch.FETCH_RESULT_NO_DATA = 1;
    /** @deprecated */
    BackgroundFetch.FETCH_RESULT_FAILED = 2;
    // ── Network type constants ────────────────────────────────────────
    BackgroundFetch.NETWORK_TYPE_NONE = 0;
    BackgroundFetch.NETWORK_TYPE_ANY = 1;
    BackgroundFetch.NETWORK_TYPE_UNMETERED = 2;
    BackgroundFetch.NETWORK_TYPE_NOT_ROAMING = 3;
    BackgroundFetch.NETWORK_TYPE_CELLULAR = 4;
    return BackgroundFetch;
}());
module.exports = BackgroundFetch;
