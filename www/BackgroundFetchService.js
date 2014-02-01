/*
 * Copyright 2013 Transistor Software <chris@transistorsoft.com>
 *   
 * Licensed under the Apache License, Version 2.0 (the "License");   
 * you may not use this file except in compliance with the License.   
 * You may obtain a copy of the License at       
 * 
 *         http://www.apache.org/licenses/LICENSE-2.0   
 *
 * Unless required by applicable law or agreed to in writing, software   
 * distributed under the License is distributed on an "AS IS" BASIS,   
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and   
 * limitations under the License.
 */

/*
 * Service Name
 * This needs to be full qualified name of your service class
 * This will be the combination of the package & class name in your service java file
 */
/*
 * Service Name
 * This needs to be full qualified name of your service class
 * This will be the combination of the package & class name in your service java file
 */
var serviceName = 'org.transistorsoft.cordova.plugin.background.fetch.BackgroundFetchService';

/*
 * Get an instance of the background service factory
 * Use it to create a background service wrapper for your service
 */
var factory = require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService')
var FetchService = factory.create(serviceName);

var fetchSuccessCallback;
var fetchFailureCallback;
var fetchTimeout;

FetchService.configure = function(successCallback, failureCallback, config) {
    if (!successCallback) {
        alert('BackgroundFetchService must be configured with a successCallback');
        return false;
    }
    config = config || {};

    fetchSuccessCallback = successCallback;
    fetchFailureCallback = failureCallback || function() {
        alert('BackgroundFetchService ERROR');
    };

    var timeout = config.timeout || 15;
    fetchTimeout = parseFloat(timeout, 10) * 60 * 1000;   // 15 minutes worth of milliseconds.

    this.registerForBootStart(function() {
        console.log('- [js]BackgroundFetchService registered for boot-start');
    }, function() {
        console.log('- [js]BackgroundFetchService failed to register for bootStart');
    });
};

FetchService.start = function(successCallback, failureCallback) {
    if (!fetchSuccessCallback && fetchTimeout) {
        alert('BackgroundFetchService must be configured');
        return false;
    }
    var me = this;

    me.startService(function() {
        me.enableTimer(fetchTimeout, function(res) {
            me.registerForUpdates(fetchSuccessCallback, fetchFailureCallback);
        }, function(res) {
            alert('FAIL enableTimer' +  res);
        });
    }, function() {
        alert('- [js]BackgroundFetchService:  Failed to start service');
    });
};
FetchService.stop = function(successCallback, failureCallback) {
    var emptyFn = function() {},
        successCallback = successCallback || emptyFn,
        failureCallback = failureCallback || emptyFn;
    this.stopService(successCallback, failureCallback);
};
FetchService.finish = function(successCallback, failureCallback) {
    // no implementation for Android
};

module.exports = FetchService;
