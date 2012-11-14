define(['jquery',
        'underscore',
        'utils/device/deviceInfo'
    ],
    function (
        $,
        _,
        deviceInfo
        ) {

        var SyncTimer = function (regSync, regDateKey, updateInterval, modelSyncs, logLabel, firstTimeSuccess) {


            var self = this;
            var currentScheduleId;

            var performSync = function (lastUpdate, now) {

                var dfd = $.Deferred();

                if (!deviceInfo.isOnline()) {
                    var offlineErrMsg = 'offline for sync ' + logLabel;
                    console.error(offlineErrMsg);
                    dfd.reject(new Error(offlineErrMsg));
                    return;
                }

                console.log('time for another sync ' + logLabel);

                var modelSyncPromises = _(modelSyncs).map(function (modelSync) {
                    return modelSync.sync(lastUpdate);
                });

                $.when.apply($, modelSyncPromises)
                .done(function () {

                    console.log('synced ' + logLabel);
                    var markDate = self.getUpdateDate(now);

                    try {
                        regSync.lastUpdate(regDateKey, markDate);
                        dfd.resolve();
                    } catch (e) {
                        console.error(e.message);
                        dfd.reject(e);
                    }
                })
                .fail(dfd.reject);

                return dfd.promise();
            };

            var reschedule = function () { //to ensure deferred doesn't send through some wierd parameters
                schedule();
            };

            this.getUpdateDate = function (now) { //for daily morning, set to now at 8AM so tomorrow's will fire
                return now;
            };

            var schedule = function (next) {

                next = next || updateInterval + 1;

                console.log('schedule ' + logLabel + ' ' + (next / 60));

                currentScheduleId = window.setTimeout(function () { //todo, what if error continue schedule

                    try {
                        var lu = regSync.lastUpdate(regDateKey);
                        var now = new Date();
                        performSync(lu, now)
                            .always(reschedule); //reschedule no matter what

                    } catch (e) {
                        console.log(e);
                        reschedule();
                    }

                }, next * 1000);

            };

            this.init = function () {

                var lastUpdate = regSync.lastUpdate(regDateKey);
                var nowCompare = new Date();
                var diff = Math.round((nowCompare - lastUpdate) / 1000);
                var diagnoseDate = new Date();

                var dfd = $.Deferred();

                if (diff < updateInterval) {

                    dfd.resolve();
                    schedule(updateInterval - diff + 1);
                    window.profile(diagnoseDate, 'sync (no init) of ' + logLabel);
                }
                else {

                    //todo just schedule this with 0, then send callback?
                    performSync(lastUpdate, nowCompare)
                        .done(function () {
                            dfd.resolve();
                            reschedule();
                            window.profile(diagnoseDate, 'sync of ' + logLabel);
                        })
                        .fail(function (err) {
                            dfd.reject(err);
                            if (firstTimeSuccess)
                                reschedule();
                        });
                }

                return dfd.promise();
            };

            this.clear = function () {
                window.clearTimeout(currentScheduleId);
            };

            this.pulse = function () { //todo we can unify pulse and init a little better

                var dfd = $.Deferred();

                try {

                    this.clear();
                    var lastUpdate = regSync.lastUpdate(regDateKey);
                    var now = new Date();

                    performSync(lastUpdate, now)
                        .done(function () {
                            dfd.resolve();
                            reschedule();
                        })
                        .fail(function (err) {
                            dfd.reject(err);
                            reschedule();
                        });

                } catch (e) {
                    dfd.reject(e);
                    reschedule();
                }

                return dfd.promise();
            };
        };

        return SyncTimer;
    });

