/***
 * Custom Cordova Background Fetch plugin. 
 * @author <chris@transistorsoft.com>
 * @author <brian@briansamson.com>
 * iOS native-side is largely based upon http://www.mindsizzlers.com/2011/07/ios-background-location/
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/
var exec = require("cordova/exec");
module.exports = {
    /**
    * @property {Boolean} flag to determine if a current fetch operation is active
    */
    isActive: false,

    configure: function(callback, failure, config) {
        var me = this,
            config = config || {};
        // wrap the supplied callback so we can set isActive flag.
        var success = function() {
            me.isActive = true;
            callback.apply(me, arguments);    
        };
        exec(success || function() {},
             failure || function() {},
             'BackgroundFetch',
             'configure',
             [config]);
    },
    finish: function(success, failure) {
        exec(success || function(){},
            failure || function(){},
            'BackgroundFetch',
            'finish',
            []);
        this.isActive = false;
    }
};

