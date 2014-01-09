package org.transistorsoft.cordova.plugin.background.fetch;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;

public class BackgroundFetchService extends BackgroundService {
    
    private final static String TAG = BackgroundFetchService.class.getSimpleName();
    
    @Override
    protected JSONObject doWork() {
        JSONObject result = new JSONObject();
        
        return result;  
    }

    @Override
    protected JSONObject getConfig() {
        JSONObject result = new JSONObject();
        
        return result;
    }

    @Override
    protected void setConfig(JSONObject config) {
        
    }     

    @Override
    protected JSONObject initialiseLatestResult() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    protected void onTimerEnabled() {
        // TODO Auto-generated method stub
        
    }

    @Override
    protected void onTimerDisabled() {
        // TODO Auto-generated method stub
        
    }


}