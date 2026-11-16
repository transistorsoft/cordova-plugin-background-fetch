package com.transistorsoft.cordova.backgroundfetch;

import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BackgroundFetchConfig;
import com.transistorsoft.tsbackgroundfetch.LifecycleManager;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;

import android.annotation.TargetApi;
import android.app.Activity;
import android.util.Log;

import java.lang.ref.WeakReference;

public class CDVBackgroundFetch extends CordovaPlugin {
    private static final String ACTION_SCHEDULE_TASK          = "scheduleTask";
    private static final String FETCH_TASK_ID                 = "cordova-background-fetch";
    private static final String HEADLESS_JOB_SERVICE_CLASS = "com.transistorsoft.cordova.backgroundfetch.BackgroundFetchHeadlessTask";
    @Override
    protected void pluginInitialize() {
      Log.d(BackgroundFetch.TAG, "[CDVBackgroundFetch pluginInitialize]");
      BackgroundFetch.getInstance(cordova.getContext());
    }

    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
        Log.d(BackgroundFetch.TAG, "[CDVBackgroundFetch] " + action + "()");
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
            // (WO-009) Without it execute() returns false and cordova-android answers the same callbackId a second
            // time, with INVALID_ACTION ("Invalid action"), which only the order of the two answers kept from the
            // failure callback.
            result = true;
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
            @Override public void onTimeout(String taskId) {
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, taskId);
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

    // (WO-010) The CordovaActivity resumed most recently.  Static because each CordovaActivity has its own
    // PluginManager and its own instance of this plugin; weak so that it never keeps a destroyed Activity alive.  The
    // plugin is onload on Android (plugin.xml): when the Activity loads its page in onCreate, as CordovaActivity's
    // template does, each instance exists before its Activity's first onResume.  An Activity that loads its page later
    // is recorded at its next resume.
    private static WeakReference<Activity> sResumedActivity = new WeakReference<>(null);

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
        sResumedActivity = new WeakReference<>(cordova.getActivity());
        // (WO-003, WO-010) A CordovaActivity is on screen, so the app is not headless.  ProcessLifecycleOwner sends no
        // ON_START when the new Activity resumes within 700 ms of the old one's pause, so nothing else clears the
        // flag then.
        LifecycleManager.getInstance().setHeadless(false);
    }

    @Override
    public void onDestroy() {
        // (WO-003, WO-010) Only the plugin sees its Activity destroyed in a live process: ProcessLifecycleOwner never
        // sends ON_DESTROY.  Unless the SDK goes headless here, the next fetch goes to this destroyed page's callback,
        // and nothing finishes it.  cordova.getActivity() is this instance's own Activity.  Three onDestroys are not a
        // termination:
        // - (WO-010) a page load in a live Activity: PluginManager.init destroys every plugin instance when the WebView
        //   loads a new page (navigator.app.loadUrl, the errorUrl page, a native loadUrl), and the next page's onload
        //   instance gets no onResume to clear the flag.  isDestroyed() tells the two apart: Activity.performDestroy
        //   sets it before calling onDestroy;
        // - a configuration-change recreation (WO-003): a new Activity follows at once;
        // - (WO-010) the destroy of an Activity that is no longer the one resumed last: when an app restarts itself,
        //   the new Activity resumes before the old one is destroyed, and its page is on screen.  React Native and
        //   Capacitor (WO-007) ignore that destroy too.
        Activity activity = cordova.getActivity();
        if (activity != null && activity.isDestroyed() && activity == sResumedActivity.get()
                && !activity.isChangingConfigurations()) {
            LifecycleManager.getInstance().setHeadless(true);
        }
        super.onDestroy();
    }
}
