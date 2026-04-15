"use strict";
var exec = require('cordova/exec');
var MODULE = 'BackgroundFetch';
var EMPTY_FN = function () { };
var STATUS_RESTRICTED = 0;
var STATUS_DENIED = 1;
var STATUS_AVAILABLE = 2;
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
    BackgroundFetch.start = function (success, failure) {
        exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'start', []);
    };
    BackgroundFetch.stop = function (success, failure) {
        exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'stop', []);
    };
    BackgroundFetch.finish = function (taskId, success, failure) {
        if (typeof taskId !== 'string') {
            throw '[BackgroundFetch] finish requires a String taskId as first argument';
        }
        exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'finish', [taskId]);
    };
    BackgroundFetch.scheduleTask = function (config, success, failure) {
        if (typeof config !== 'object') {
            throw '[BackgroundFetch] scheduleTask error: The 1st argument is a config {}';
        }
        exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'scheduleTask', [config]);
    };
    BackgroundFetch.stopTask = function (taskId, success, failure) {
        if (typeof taskId !== 'string') {
            throw '[BackgroundFetch] stopTask error: The 1st argument must be a taskId:String';
        }
        exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'stop', [taskId]);
    };
    BackgroundFetch.status = function (callback) {
        exec(callback || EMPTY_FN, EMPTY_FN, MODULE, 'status', []);
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
