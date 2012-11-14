define(['jquery', 'underscore', 'backbone', 'router', 'utils/sync/appSync',
        'channel', 'views/appView', 'appConfig',
        'utils/bootstrap', 'utils/test/stopGap'],
    function ($, _, Backbone, Router, AppSync, channel, AppView, appConfig) {

        var init = function () {

            var now = new Date();
            var app = new AppSync();
            var firstTimeSyncing = true;

            function onSyncError(error) {
                console.error(error);
                alert(error);
                firstTimeSyncing = false;
                if (navigator && navigator.app)
                    navigator.app.exitApp();
            }


            function onDeviceReady() {

                document.addEventListener("resume", onResume, false);
                document.addEventListener("pause", onPause, false);
                document.addEventListener("backbutton", onBack, false);

                window.profile(now, 'app started');

                firstTimeSyncing = true;

                app.sync(
                    function () {
                        $(function () {

                            firstTimeSyncing = false;
                            window.profile(now, 'sync (total)');
                            Router.initialize();

                        });
                    },
                    onSyncError);
            };

            function onResume() {

                channel.trigger('app:comm:stop');
                console.log('app resumed');

                if (firstTimeSyncing) return;

                app.reSync(
                    function () { },
                    function () { });
            };



            // Handle the pause event
            //
            function onPause() {
                channel.trigger('app:comm:start');
                app.clear();
            }


            function onBack(e) {
                if (Backbone.history.fragment === '') {
                    e.preventDefault();
                    //navigator.app.exitApp();
                }
                else {
                    navigator.app.backHistory();
                }
            }

            //test for non phonegap
            //testing only
            if (appConfig.test.isWebEnv)
                onDeviceReady();
            else
                document.addEventListener("deviceready", onDeviceReady, false);

        };

        return {
            initialize: init
        };
    });

