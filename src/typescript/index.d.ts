import { BackgroundFetchConfig, TaskConfig, BackgroundFetchStatus, NetworkType } from '@transistorsoft/background-fetch-types';
/** @deprecated */
declare type BackgroundFetchResult = 0 | 1 | 2;
declare class BackgroundFetch {
    static STATUS_RESTRICTED: BackgroundFetchStatus;
    static STATUS_DENIED: BackgroundFetchStatus;
    static STATUS_AVAILABLE: BackgroundFetchStatus;
    /** @deprecated */
    static FETCH_RESULT_NEW_DATA: BackgroundFetchResult;
    /** @deprecated */
    static FETCH_RESULT_NO_DATA: BackgroundFetchResult;
    /** @deprecated */
    static FETCH_RESULT_FAILED: BackgroundFetchResult;
    static NETWORK_TYPE_NONE: NetworkType;
    static NETWORK_TYPE_ANY: NetworkType;
    static NETWORK_TYPE_UNMETERED: NetworkType;
    static NETWORK_TYPE_NOT_ROAMING: NetworkType;
    static NETWORK_TYPE_CELLULAR: NetworkType;
    static configure(config: BackgroundFetchConfig, onEvent: (taskId: string) => void, onTimeout: (taskId: string) => void): Promise<BackgroundFetchStatus>;
    static start(success?: (status: BackgroundFetchStatus) => void, failure?: (status: BackgroundFetchStatus) => void): Promise<BackgroundFetchStatus>;
    static stop(taskId?: string | null): Promise<boolean>;
    static stop(taskId: string, success?: () => void, failure?: (error: string) => void): Promise<boolean>;
    static stop(success?: (() => void) | null, failure?: (error: string) => void): Promise<boolean>;
    static finish(taskId: string, success?: () => void, failure?: (error: string) => void): void;
    static scheduleTask(config: TaskConfig, success?: () => void, failure?: (error: string) => void): Promise<boolean>;
    /** @deprecated Use {@link BackgroundFetch.stop}(taskId). (WO-009) */
    static stopTask(taskId: string, success?: () => void, failure?: (error: string) => void): Promise<boolean>;
    static status(callback?: (status: BackgroundFetchStatus) => void): Promise<BackgroundFetchStatus>;
}
export = BackgroundFetch;
