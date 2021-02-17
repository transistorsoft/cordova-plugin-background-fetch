package com.transistorsoft.cordova.backgroundfetch;

import android.content.Context;

import com.transistorsoft.tsbackgroundfetch.BGTask;

/**
 * Created by chris on 2018-01-22.
 */

public interface HeadlessTask {
    void onFetch(Context context, BGTask task);
}
