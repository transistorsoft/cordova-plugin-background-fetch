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
import android.app.Activity;
import android.content.Intent;

public class CDVBackgroundFetch extends CordovaPlugin {
    private static final String JOB_SERVICE_CLASS = "HeadlessJobService";

    private boolean isForceReload = false;

    @Override
    protected void pluginInitialize() {
        Activity activity   = cordova.getActivity();
        Intent launchIntent = activity.getIntent();
        String action 		= launchIntent.getAction();

        if ((action != null) && (BackgroundFetch.ACTION_FORCE_RELOAD.equalsIgnoreCase(action))) {
            isForceReload = true;
            activity.moveTaskToBack(true);
        }
    }

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
            stop(callbackContext);
        } else if (BackgroundFetch.ACTION_STATUS.equalsIgnoreCase(action)) {
            result = true;
            callbackContext.success(getAdapter().status());
        } else if (BackgroundFetch.ACTION_FINISH.equalsIgnoreCase(action)) {
            finish(callbackContext);
            result = true;
        }
        return result;
    }

    private void configure(JSONObject options, final CallbackContext callbackContext) throws JSONException {
        BackgroundFetch adapter = getAdapter();

        BackgroundFetchConfig.Builder config = new BackgroundFetchConfig.Builder();
        if (options.has("minimumFetchInterval")) {
            config.setMinimumFetchInterval(options.getInt("minimumFetchInterval"));
        }
        if (options.has("stopOnTerminate")) {
            config.setStopOnTerminate(options.getBoolean("stopOnTerminate"));
        }
        if (options.has("forceReload")) {
            config.setForceReload(options.getBoolean("forceReload"));
        }
        if (options.has("startOnBoot")) {
            config.setStartOnBoot(options.getBoolean("startOnBoot"));
        }
        if (options.has("enableHeadless") && options.getBoolean("enableHeadless")) {
            config.setJobService(getClass().getPackage().getName() + "." + JOB_SERVICE_CLASS);
        }
        BackgroundFetch.Callback callback = new BackgroundFetch.Callback() {
            @Override
            public void onFetch() {
                PluginResult result = new PluginResult(PluginResult.Status.OK);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        adapter.configure(config.build(), callback);
        if (isForceReload) {
            callback.onFetch();
        }
        isForceReload = false;
    }

    @TargetApi(21)
    private void start(CallbackContext callbackContext) {
        BackgroundFetch adapter = getAdapter();
        adapter.start();
        callbackContext.success(adapter.status());
    }

    private void stop(CallbackContext callbackContext) {
        BackgroundFetch adapter = getAdapter();
        adapter.stop();
        callbackContext.success();
    }

    private void finish(CallbackContext callbackContext) {
        BackgroundFetch adapter = getAdapter();
        adapter.finish();
        callbackContext.success();
    }

    private BackgroundFetch getAdapter() {
        return BackgroundFetch.getInstance(cordova.getActivity().getApplicationContext());
    }
}
