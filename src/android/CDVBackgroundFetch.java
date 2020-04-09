package com.transistorsoft.cordova.backgroundfetch;

import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BackgroundFetchConfig;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;

import android.annotation.TargetApi;

public class CDVBackgroundFetch extends CordovaPlugin {

    private static final String ACTION_SCHEDULE_TASK          = "scheduleTask";

    private static final String FETCH_TASK_ID                 = "cordova-background-fetch";

    private static final String HEADLESS_JOB_SERVICE_CLASS = "com.transistorsoft.cordova.backgroundfetch.BackgroundFetchHeadlessTask";

    @Override
    protected void pluginInitialize() { }

    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
        boolean result = false;
        if (BackgroundFetch.ACTION_CONFIGURE.equalsIgnoreCase(action)) {
            result = true;
            configure(data.getJSONObject(0), callbackContext);
        } else if (BackgroundFetch.ACTION_START.equalsIgnoreCase(action)) {
            result = true;
            start(callbackContext);
        } else if (BackgroundFetch.ACTION_STOP.equalsIgnoreCase(action)) {
            result = true;
            stop(data, callbackContext);
        } else if (BackgroundFetch.ACTION_STATUS.equalsIgnoreCase(action)) {
            result = true;
            callbackContext.success(getAdapter().status());
        } else if (BackgroundFetch.ACTION_FINISH.equalsIgnoreCase(action)) {
            finish(data.getString(0), callbackContext);
            result = true;
        } else if (ACTION_SCHEDULE_TASK.equalsIgnoreCase(action)) {
            scheduleTask(data.getJSONObject(0), callbackContext);
        }
        return result;
    }

    private void configure(JSONObject options, final CallbackContext callbackContext) throws JSONException {
        BackgroundFetch adapter = getAdapter();

        BackgroundFetchConfig.Builder config = buildConfig(options)
            .setTaskId(FETCH_TASK_ID)
            .setIsFetchTask(true);

        adapter.configure(config.build(), new BackgroundFetch.Callback() {
            @Override public void onFetch(String taskId) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, taskId);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        });
    }

    @TargetApi(21)
    private void start(CallbackContext callbackContext) {
        BackgroundFetch adapter = getAdapter();
        adapter.start(FETCH_TASK_ID);
        callbackContext.success(adapter.status());
    }

    private void stop(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String taskId = null;
        if (args.length() > 0) {
            taskId = args.getString(0);
        }
        BackgroundFetch adapter = getAdapter();
        adapter.stop(taskId);
        callbackContext.success();
    }

    private void scheduleTask(JSONObject params, CallbackContext callbackContext) throws JSONException {
        BackgroundFetch adapter = getAdapter();
        adapter.scheduleTask(buildConfig(params).build());
        callbackContext.success();
    }

    private void finish(String taskId, CallbackContext callbackContext) {
        BackgroundFetch adapter = getAdapter();
        adapter.finish(taskId);
        callbackContext.success();
    }

    private BackgroundFetch getAdapter() {
        return BackgroundFetch.getInstance(cordova.getActivity().getApplicationContext());
    }

    private BackgroundFetchConfig.Builder buildConfig(JSONObject options) throws JSONException {
        BackgroundFetchConfig.Builder config = new BackgroundFetchConfig.Builder();

        if (options.has(BackgroundFetchConfig.FIELD_TASK_ID)) {
            config.setTaskId(options.getString(BackgroundFetchConfig.FIELD_TASK_ID));
        }
        if (options.has(BackgroundFetchConfig.FIELD_MINIMUM_FETCH_INTERVAL)) {
            config.setMinimumFetchInterval(options.getInt(BackgroundFetchConfig.FIELD_MINIMUM_FETCH_INTERVAL));
        }
        if (options.has(BackgroundFetchConfig.FIELD_DELAY)) {
            config.setDelay(options.getLong(BackgroundFetchConfig.FIELD_DELAY));
        }
        if (options.has(BackgroundFetchConfig.FIELD_STOP_ON_TERMINATE)) {
            config.setStopOnTerminate(options.getBoolean(BackgroundFetchConfig.FIELD_STOP_ON_TERMINATE));
        }
        if (options.has(BackgroundFetchConfig.FIELD_START_ON_BOOT)) {
            config.setStartOnBoot(options.getBoolean(BackgroundFetchConfig.FIELD_START_ON_BOOT));
        }
        if (options.has("enableHeadless") && options.getBoolean("enableHeadless")) {
            config.setJobService(HEADLESS_JOB_SERVICE_CLASS);
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRED_NETWORK_TYPE)) {
            config.setRequiredNetworkType(options.getInt(BackgroundFetchConfig.FIELD_REQUIRED_NETWORK_TYPE));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_BATTERY_NOT_LOW)) {
            config.setRequiresBatteryNotLow(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_BATTERY_NOT_LOW));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_CHARGING)) {
            config.setRequiresCharging(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_CHARGING));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_DEVICE_IDLE)) {
            config.setRequiresDeviceIdle(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_DEVICE_IDLE));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_STORAGE_NOT_LOW)) {
            config.setRequiresStorageNotLow(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_STORAGE_NOT_LOW));
        }
        if (options.has(BackgroundFetchConfig.FIELD_FORCE_ALARM_MANAGER)) {
            config.setForceAlarmManager(options.getBoolean(BackgroundFetchConfig.FIELD_FORCE_ALARM_MANAGER));
        }
        if (options.has(BackgroundFetchConfig.FIELD_PERIODIC)) {
            config.setPeriodic(options.getBoolean(BackgroundFetchConfig.FIELD_PERIODIC));
        }
        return config;
    }
}
