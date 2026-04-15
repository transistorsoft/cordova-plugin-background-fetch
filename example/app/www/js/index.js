document.addEventListener('deviceready', onDeviceReady, false);

var BackgroundFetch = window.BackgroundFetch;

function log(msg, type) {
    var el = document.getElementById('events');
    var li = document.createElement('li');
    li.className = type || '';
    var ts = new Date().toLocaleTimeString();
    li.textContent = '[' + ts + '] ' + msg;
    el.insertBefore(li, el.firstChild);
    console.log('[BackgroundFetch] ' + msg);
}

function onDeviceReady() {
    log('Device ready — configuring BackgroundFetch');

    BackgroundFetch.configure({
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true
    }, function(taskId) {
        // Background fetch event received.
        log('EVENT: ' + taskId, 'event');

        // Simulate some async work.
        setTimeout(function() {
            BackgroundFetch.finish(taskId);
        }, 2000);

    }, function(taskId) {
        // Task timeout — stop immediately.
        log('TIMEOUT: ' + taskId, 'timeout');
        BackgroundFetch.finish(taskId);
    });

    // Wire up buttons.
    document.getElementById('btn-start').addEventListener('click', function() {
        BackgroundFetch.start(function() {
            log('Started', 'status');
        });
    });

    document.getElementById('btn-stop').addEventListener('click', function() {
        BackgroundFetch.stop(function() {
            log('Stopped', 'status');
        });
    });

    document.getElementById('btn-status').addEventListener('click', function() {
        BackgroundFetch.status(function(status) {
            var labels = ['RESTRICTED', 'DENIED', 'AVAILABLE'];
            log('Status: ' + (labels[status] || status), 'status');
        });
    });

    document.getElementById('btn-clear').addEventListener('click', function() {
        document.getElementById('events').innerHTML = '';
    });
}
