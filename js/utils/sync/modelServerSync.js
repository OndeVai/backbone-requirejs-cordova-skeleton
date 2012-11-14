define(['jquery', 'underscore', 'backbone', 'backboneWebSql'], function ($, _, Backbone) {
    var SyncBase = function (ListItemModel, ItemModel, skipCreateTable) {

        this.ListItemModel = ListItemModel;
        this.ItemModel = ItemModel;

        var logLabel = new this.ItemModel().localStoreMeta.store;

        this.sync = function (lastUpdate) {

            var dfd = $.Deferred();

            var self = this;

            self.createTable(function () {
                self.syncFromLastMod(lastUpdate, dfd.resolve, dfd.reject);
            }, dfd.reject);

            return dfd.promise();
        };

        this.createTable = function (callback, errorCallback) {

            if (skipCreateTable) {
                callback();
                return;
            }

            Backbone.sync('createTable',
                        new this.ItemModel(),
                        { success: callback, error: errorCallback });
        };

        this.syncFromLastMod = function (lastUpdate, callback, errorCallback) {

            var self = this;
            console.log('Starting synchronization for ' + logLabel);
            self.getChanges(lastUpdate,
                            function (changes) {

                                if (changes && changes.length > 0) {
                                    self.applyChanges(changes, callback, errorCallback);
                                } else {
                                    console.log('Nothing to synchronize for ' + logLabel);
                                    callback();
                                }
                            },
                            errorCallback);
        };

        this.getChanges = function (lastUpdate, callback, errorCallback) {

            Backbone.syncServer('read',
                                new this.ListItemModel({ lastUpdate: lastUpdate }),
                                {
                                    success: function (data) { callback(data); },
                                    error: errorCallback
                                });
        };

        this.applyChanges = function (items, callback, errorCallback) {

            var modelDel = new this.ItemModel(items[0]);

            $.when(this.applyRows(items))
                .then(function () {

                    if (items.length === 0) {
                        callback();
                        return;
                    }

                    Backbone.sync('deleteExpr', modelDel, {
                        success: callback,
                        error: errorCallback
                    });


                },
            errorCallback);

        };


        this.applyRows = function (items) {


            var dfd = $.Deferred();

            var options = {
                success: function () {
                },
                error: dfd.reject
            };

            var l = items.length;

            if (l === 0) {

                dfd.resolve();
                return;
            }

            var self = this;

            Backbone.sync('trans', new self.ItemModel(items[0]), {

                process: function (tx1) {

                    options.tx = tx1;

                    for (var i = 0; i < l; i++) {
                        var model = new self.ItemModel(items[i]);
                        var isDeleted = items[i].IsDeleted;
                        if (isDeleted) {
                            Backbone.sync('delete', model, options);
                        }
                        else {
                            Backbone.sync('create', model, options);
                        }
                    }
                },
                success: dfd.resolve,
                error: dfd.reject

            });

            return dfd.promise();

        };
    };

    return SyncBase;
});

