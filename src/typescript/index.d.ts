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
    static start(success?: () => void, failure?: (status: BackgroundFetchStatus) => void): void;
    static stop(success?: () => void, failure?: (error: string) => void): void;
    static finish(taskId: string, success?: () => void, failure?: (error: string) => void): void;
    static scheduleTask(config: TaskConfig, success?: () => void, failure?: (error: string) => void): void;
    static stopTask(taskId: string, success?: () => void, failure?: (error: string) => void): void;
    static status(callback: (status: BackgroundFetchStatus) => void): void;
}
export = BackgroundFetch;
