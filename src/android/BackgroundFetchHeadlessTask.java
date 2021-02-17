package com.transistorsoft.cordova.backgroundfetch;

import android.content.Context;
import android.util.Log;

import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BGTask;

/**
 * Created by chris on 2018-01-22.
 */

public class BackgroundFetchHeadlessTask implements HeadlessTask {
    @Override
    public void onFetch(Context context, BGTask task) {
        Log.d(BackgroundFetch.TAG, "BackgroundFetchHeadlessTask onFetch: taskId: " + task.getTaskId() + ", timeout: " + task.getTimedOut() + "-- DEFAULT IMPLEMENTATION");
        BackgroundFetch.getInstance(context).finish(taskId);
    }
}
