define(['utils/sync/modelServerSync', 'require'], function (SyncBase, require) {

    var SyncBaseOneTime = function (listItemModel, itemModel, initialDataFile) {

        SyncBase.call(this, listItemModel, itemModel);

        this.getChanges = function (lastUpdate, callback, errorCallback) {

            require(['text!' + initialDataFile],
                function (initialData) {
                    try {
                        var staticData = JSON.parse(initialData);
                        callback(staticData);
                    } catch (e) {
                        errorCallback(e);
                    }
                }, function (err) {
                    errorCallback(err);
                });

        };
    };

    SyncBaseOneTime.prototype = SyncBase.prototype;
    SyncBaseOneTime.prototype.constructor = SyncBaseOneTime;

    return SyncBaseOneTime;
});

