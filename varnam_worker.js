// Handles BG activities

var learnFromQueue = require('./bg/learn_from_queue.js'),
    pushDownloads  = require('./bg/push_downloads.js'),
    sleepTimeInSec = 10,
    jobs = [learnFromQueue.startLearning, learnFromQueue.deleteOldRecords, pushDownloads.startPushing];

function dispatcher() {
    for (var i = 0; i < jobs.length; i++) {
        var job = jobs[i];
        try {
            job();
        }
        catch (err) {
            console.log ("Exception occured." + err);
        }
    }
    setTimeout (dispatcher, sleepTimeInSec * 1000);
}

setTimeout (dispatcher, sleepTimeInSec * 1000);

