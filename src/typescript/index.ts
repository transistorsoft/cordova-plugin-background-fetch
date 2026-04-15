import {
  BackgroundFetchConfig,
  TaskConfig,
  BackgroundFetchStatus,
  NetworkType,
} from '@transistorsoft/background-fetch-types';

/** @deprecated */
type BackgroundFetchResult = 0 | 1 | 2;

declare const require: (module: string) => any;
const exec = require('cordova/exec');

const MODULE = 'BackgroundFetch';
const EMPTY_FN = function() {};

const STATUS_RESTRICTED:BackgroundFetchStatus = 0;
const STATUS_DENIED:BackgroundFetchStatus = 1;
const STATUS_AVAILABLE:BackgroundFetchStatus = 2;

class BackgroundFetch {
  // ── Status constants ──────────────────────────────────────────────
  static STATUS_RESTRICTED:BackgroundFetchStatus = STATUS_RESTRICTED;
  static STATUS_DENIED:BackgroundFetchStatus = STATUS_DENIED;
  static STATUS_AVAILABLE:BackgroundFetchStatus = STATUS_AVAILABLE;

  // ── Deprecated fetch-result constants ─────────────────────────────
  /** @deprecated */
  static FETCH_RESULT_NEW_DATA:BackgroundFetchResult = 0;
  /** @deprecated */
  static FETCH_RESULT_NO_DATA:BackgroundFetchResult = 1;
  /** @deprecated */
  static FETCH_RESULT_FAILED:BackgroundFetchResult = 2;

  // ── Network type constants ────────────────────────────────────────
  static NETWORK_TYPE_NONE:NetworkType = 0;
  static NETWORK_TYPE_ANY:NetworkType = 1;
  static NETWORK_TYPE_UNMETERED:NetworkType = 2;
  static NETWORK_TYPE_NOT_ROAMING:NetworkType = 3;
  static NETWORK_TYPE_CELLULAR:NetworkType = 4;

  // ── Methods ───────────────────────────────────────────────────────

  static configure(
    config: BackgroundFetchConfig,
    onEvent: (taskId: string) => void,
    onTimeout: (taskId: string) => void
  ): Promise<BackgroundFetchStatus> {
    if (typeof config !== 'object') {
      throw '[BackgroundFetch] configure error: the first argument to #configure is the Config {}';
    }
    if (typeof onEvent !== 'function') {
      throw '[BackgroundFetch] configure error: You must provide the fetch callback function as 2nd argument to #configure method';
    }
    if (typeof onTimeout !== 'function') {
      console.warn('[BackgroundFetch] configure: You did not provide a 3rd argument onTimeout callback. This callback is a signal from the OS that your allowed background time is about to expire. Use this callback to finish what you\'re doing and immediately call BackgroundFetch.finish(taskId)');
      onTimeout = function(taskId: string) {
        console.warn('[BackgroundFetch] default onTimeout callback fired. You should provide your own onTimeout callback to .configure(options, onEvent, onTimeout)');
        BackgroundFetch.finish(taskId);
      };
    }
    return new Promise(function(resolve, reject) {
      const onStatus = function(status: BackgroundFetchStatus) {
        if (status === STATUS_AVAILABLE) {
          resolve(status);
        } else {
          reject(status);
        }
      };
      exec(onEvent, onTimeout, MODULE, 'configure', [config]);
      exec(onStatus, onStatus, MODULE, 'status', []);
    });
  }

  static start(success?: () => void, failure?: (status: BackgroundFetchStatus) => void): void {
    exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'start', []);
  }

  static stop(success?: () => void, failure?: (error: string) => void): void {
    exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'stop', []);
  }

  static finish(taskId: string, success?: () => void, failure?: (error: string) => void): void {
    if (typeof taskId !== 'string') {
      throw '[BackgroundFetch] finish requires a String taskId as first argument';
    }
    exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'finish', [taskId]);
  }

  static scheduleTask(config: TaskConfig, success?: () => void, failure?: (error: string) => void): void {
    if (typeof config !== 'object') {
      throw '[BackgroundFetch] scheduleTask error: The 1st argument is a config {}';
    }
    exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'scheduleTask', [config]);
  }

  static stopTask(taskId: string, success?: () => void, failure?: (error: string) => void): void {
    if (typeof taskId !== 'string') {
      throw '[BackgroundFetch] stopTask error: The 1st argument must be a taskId:String';
    }
    exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'stop', [taskId]);
  }

  static status(callback: (status: BackgroundFetchStatus) => void): void {
    exec(callback || EMPTY_FN, EMPTY_FN, MODULE, 'status', []);
  }
}

export = BackgroundFetch;
