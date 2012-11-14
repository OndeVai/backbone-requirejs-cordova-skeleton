define(['jquery',
        'utils/sync/registrySync',
        'utils/sync/modelServerSync',
        'utils/sync/modelServerSyncOneTime',
        'models/circuit',
        'collections/circuits',
        'models/goRound',
        'collections/goRounds',
        'models/standingType',
        'collections/standingTypes',
        'models/rodeo',
        'collections/rodeos',
        'models/newsItem',
        'collections/newsItems',
        'models/eventSchedule',
        'collections/eventSchedules',
        'models/tvSchedule',
        'collections/tvSchedules',
        'models/injuryReport',
        'collections/injuryReports',
        'models/quote',
        'collections/quotes',
        'models/video',
        'collections/videos',
        'utils/sync/tweetSync',
        'utils/sync/quoteSync',
        'models/photo',
        'collections/photos',
        'appConfig',
        'utils/device/deviceInfo',
        'channel',
        'utils/sync/syncTimer'
    ],
    function (
        $,
        RegSync,
        ModelSync,
        ModelSyncOneTime,
        Circuit,
        Circuits,
        GoRound,
        GoRounds,
        StandingType,
        StandingTypes,
        Rodeo,
        Rodeos,
        NewsItem,
        NewsItems,
        EventSchedule,
        EventSchedules,
        TvSchedule,
        TvSchedules,
        InjuryReport,
        InjuryReports,
        Quote,
        Quotes,
        Video,
        Videos,
        TweetSync,
        QuoteSync,
        Photo,
        Photos,
        appConfig,
        deviceInfo,
        channel,
        SyncTimer
        ) {

        var AppSync = function () {

            var regSync = new RegSync();

            var firstTimeSuccess = regSync.firstTimSyncSuccess();;

            var syncOneTime = function () {

                var dfd = $.Deferred();

                if (firstTimeSuccess) {
                    dfd.resolve();
                } else {

                    var goRoundSync = new ModelSyncOneTime(GoRounds, GoRound, 'utils/sync/oneTime/gorounds.json');
                    var rodeoSyncOneTime = new ModelSyncOneTime(Rodeos, Rodeo, 'utils/sync/oneTime/rodeos.json');
                    $.when(rodeoSyncOneTime.sync(), goRoundSync.sync())
                            .then(dfd.resolve, dfd.reject);
                }

                return dfd.promise();
            };


            //setup timers


            var syncHighFqModels = [
                    new ModelSync(Rodeos, Rodeo, firstTimeSuccess),
                    new ModelSync(Videos, Video, firstTimeSuccess),
                    new ModelSync(Photos, Photo, firstTimeSuccess),
                    new ModelSync(InjuryReports, InjuryReport, firstTimeSuccess),
                    new QuoteSync(firstTimeSuccess)
            ];
            var syncTimerHighFq = new SyncTimer(regSync, appConfig.sync.registryDateKeys.highFreq, appConfig.sync.interval.highFreq,
                                                syncHighFqModels, 'high fq', firstTimeSuccess);

            var syncTimerTweet = new SyncTimer(regSync, appConfig.sync.registryDateKeys.tweet, appConfig.sync.interval.highFreq,
                                                [new TweetSync(firstTimeSuccess)], 'tweet fq', firstTimeSuccess);

            var syncTimerNews = new SyncTimer(regSync, appConfig.sync.registryDateKeys.news, appConfig.sync.interval.highFreq,
                                                [new ModelSync(NewsItems, NewsItem, firstTimeSuccess, 'news')], 'news fq', firstTimeSuccess);


            var syncLowFqModels = [
                    new ModelSync(Circuits, Circuit, firstTimeSuccess),
                    new ModelSync(StandingTypes, StandingType, firstTimeSuccess),
                    new ModelSync(TvSchedules, TvSchedule, firstTimeSuccess),
                    new ModelSync(EventSchedules, EventSchedule, firstTimeSuccess)
            ];
            var syncTimerLowFq = new SyncTimer(regSync, appConfig.sync.registryDateKeys.lowFreq, appConfig.sync.interval.lowFreq,
                                                syncLowFqModels, 'low fq', firstTimeSuccess);

            //set the update date to this morning around 7AM no matter what to ensure will kick off by morning next time
            syncTimerLowFq.getUpdateDate = function (now) {
                now.setHours(7);
                return now;
            };


            var syncPeriodic = function () {

                var dfd = $.Deferred();

                $.when(syncTimerHighFq.init(),
                       syncTimerNews.init(),
                       syncTimerLowFq.init(),
                       syncTimerTweet.init())
                        .then(dfd.resolve, dfd.reject);

                return dfd.promise();
            };

            var handleSyncSuccess = function (success) {
                regSync.firstTimSyncSuccess(true);
                success();
            };

            //bubble up sync error only if first time success
            //otherwise signal app to just launch
            var handleSyncError = function (err, errorCallback, successCallback, isPreemptiveOffline) {

                if (err) {
                    console.error(err);
                    console.error(err.message || err.statusText);
                }


                if (!firstTimeSuccess) {
                    var message = !isPreemptiveOffline ? appConfig.sync.firstTime.failureMessage : appConfig.sync.firstTime.offlineMessage;
                    errorCallback(message);
                } else
                    successCallback();

            };

            //sync signaling for tweets
            channel.on('app:sync:tweets:start', function () {

                syncTimerTweet.pulse().always(function () {
                    channel.trigger('app:sync:tweets:done');
                });
            });


            //sync signaling for news
            channel.on('app:sync:news:start', function () {

                syncTimerNews.pulse().always(function () {
                    channel.trigger('app:sync:news:done');
                });
            });

            this.reSync = function (suceess, error) {
                
				this.clear();
                this.sync(suceess, error);
            };
            
            this.clear = function () {
                
                syncTimerHighFq.clear();
                syncTimerNews.clear();
                syncTimerLowFq.clear();
                syncTimerTweet.clear();
            };

            //kick off one time and timers
            this.sync = function (success, error) {

                firstTimeSuccess = regSync.firstTimSyncSuccess();

                //check right away if offline (using phonegap's implementation), 
                //if offline, handle in the same way as a failure (with different error message)
                if (!deviceInfo.isOnline()) {
                    handleSyncError(new Error('User is offline'), error, success, true);
                    return;
                }

                //otherwise kick off the sync and scheduling 
                try {
                    regSync.initKeyDateVals();
                    $.when(syncOneTime(), syncPeriodic())
                             .done(function () {
                                 handleSyncSuccess(success);
                             })
                             .fail(function (err) {
                                 handleSyncError(err, error, success);
                             });
                }
                catch (e) {
                    handleSyncError(e, error, success);
                }

            };



        };

        return AppSync;
    });

