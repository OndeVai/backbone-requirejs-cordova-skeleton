define(['appConfig'],
    function (appConfig) {

        var RegSync = function () {

            var storageKeyFirstTime = "prca-first-time-sync-success";
            var localStorage = window.localStorage;

            

            this.lastUpdate = function (key, val) {

                if (arguments.length < 2)
                    return new Date(localStorage.getItem(key));

                localStorage.setItem(key, val);
                return val;
            };

            this.firstTimSyncSuccess = function (val) {

                if (!arguments.length)
                    return localStorage.getItem(storageKeyFirstTime);

                localStorage.setItem(storageKeyFirstTime, val);
                return val;
            };

            this.initKeyDateVals = function () {

                var regDateKeys = appConfig.sync.registryDateKeys;

                var defaultLastUpdate = appConfig.sync.firstTime.lastModifiedDate();

                for (var prop in regDateKeys) {
                    var regDateKey = regDateKeys[prop];
                    if (!localStorage.getItem(regDateKey))
                        localStorage.setItem(regDateKey, defaultLastUpdate);
                }
            };
        };


        return RegSync;
    });

