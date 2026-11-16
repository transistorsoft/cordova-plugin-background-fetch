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

// (WO-009) One native call, as @transistorsoft/background-fetch-types declares it: a Promise settled by the native
// reply.  It resolves `value` applied to what native sends (the status for start and status; `true` for the others,
// which native answers with "OK" on Android and null on iOS, so the value is supplied here and never passed through)
// and rejects with what native sends.  The callbacks a caller passes get what native sends, as before.  A caller who
// passes a callback is answered there, so the Promise gets a no-op rejection handler: a callback-only caller never
// sees an unhandled rejection.  exec is called outside the Promise's executor, so a synchronous throw from it reaches
// the caller, as it did before.
function call<T>(action: string, args: any[], value: (answer: any) => T,
                 success?: Function, failure?: Function): Promise<T> {
  let settle: (result: T) => void = EMPTY_FN;
  let fail: (error: any) => void = EMPTY_FN;
  const promise = new Promise<T>(function(resolve, reject) { settle = resolve; fail = reject; });
  if (typeof success === 'function' || typeof failure === 'function') {
    promise.catch(EMPTY_FN);
  }
  exec(function(answer: any) {
    settle(value(answer));
    if (typeof success === 'function') { success(answer); }
  }, function(error: any) {
    fail(error);
    if (typeof failure === 'function') { failure(error); }
  }, MODULE, action, args);
  return promise;
}

function asIs<T>(value: T): T { return value; }
function alwaysTrue(): boolean { return true; }

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

  // (WO-009) Resolves the status once the native start has run (both OSes reply after it), so `await start()` orders
  // it before a later stop().
  static start(success?: (status: BackgroundFetchStatus) => void,
               failure?: (status: BackgroundFetchStatus) => void): Promise<BackgroundFetchStatus> {
    return call<BackgroundFetchStatus>('start', [], asIs, success, failure);
  }

  // (WO-009) stop(taskId) stops that task alone, as the types declare; stop() stops every task.  The first argument
  // is told apart by its type, never by arguments.length, so stop(undefined) is stop().  Callbacks may follow a
  // taskId.  The 7.x callback form stop(success, failure) keeps its meaning, an empty first slot included:
  // stop(null, failure) calls `failure` only on a failure.
  static stop(taskId?: string | null): Promise<boolean>;
  static stop(taskId: string, success?: () => void, failure?: (error: string) => void): Promise<boolean>;
  static stop(success?: (() => void) | null, failure?: (error: string) => void): Promise<boolean>;
  static stop(first?: any, second?: any, third?: any): Promise<boolean> {
    if (typeof first === 'string') {
      return call<boolean>('stop', [first], alwaysTrue, second, third);
    }
    if (typeof first === 'function') {
      return call<boolean>('stop', [], alwaysTrue, first, second);
    }
    if (first !== undefined && first !== null) {
      throw '[BackgroundFetch] stop error: The 1st argument must be a taskId:String or a success callback';
    }
    // An empty first slot: the 7.x form, (success, failure) with no success, unless a third argument names the
    // failure.
    return third === undefined
      ? call<boolean>('stop', [], alwaysTrue, undefined, second)
      : call<boolean>('stop', [], alwaysTrue, second, third);
  }

  static finish(taskId: string, success?: () => void, failure?: (error: string) => void): void {
    if (typeof taskId !== 'string') {
      throw '[BackgroundFetch] finish requires a String taskId as first argument';
    }
    exec(success || EMPTY_FN, failure || EMPTY_FN, MODULE, 'finish', [taskId]);
  }

  // (WO-009) Resolves true; rejects with native's error (iOS: the error's message).
  static scheduleTask(config: TaskConfig, success?: () => void, failure?: (error: string) => void): Promise<boolean> {
    if (typeof config !== 'object') {
      throw '[BackgroundFetch] scheduleTask error: The 1st argument is a config {}';
    }
    return call<boolean>('scheduleTask', [config], alwaysTrue, success, failure);
  }

  /** @deprecated Use {@link BackgroundFetch.stop}(taskId). (WO-009) */
  static stopTask(taskId: string, success?: () => void, failure?: (error: string) => void): Promise<boolean> {
    if (typeof taskId !== 'string') {
      throw '[BackgroundFetch] stopTask error: The 1st argument must be a taskId:String';
    }
    return call<boolean>('stop', [taskId], alwaysTrue, success, failure);
  }

  // (WO-009) The callback is optional, as the types declare.
  static status(callback?: (status: BackgroundFetchStatus) => void): Promise<BackgroundFetchStatus> {
    return call<BackgroundFetchStatus>('status', [], asIs, callback);
  }
}

export = BackgroundFetch;
