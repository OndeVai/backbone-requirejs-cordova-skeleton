define(['jquery', 'utils/sync/modelServerSync', 'collections/quotes', 'models/quote'],
    function ($, SyncBase, Quotes, Quote) {

        var QuoteSync = function (firstTimeSuccess) {

            SyncBase.call(this, Quotes, Quote, firstTimeSuccess);



            this.getChanges = function (lastUpdate, callback, errorCallback) {

                var self = this;
                Backbone.syncServer('read',
                                new Quotes({ lastUpdate: lastUpdate, currQuoteId: this.lastQuote() }),
                                {
                                    success: function (data) {
                                        if (data) {

                                            if (!$.isArray(data)) {
                                                self.lastQuote(data.Id);
                                                data = [data];
                                            }
                                        }
                                        else {
                                            data = [];
                                        }

                                        callback(data);
                                    },
                                    error: errorCallback
                                });
            };

            this.lastQuote = function (val) {

                var key = 'prca_lastQuote';
                if (arguments.length < 1)
                    return localStorage.getItem(key);

                localStorage.setItem(key, val);
                return val;
            };
        };

        QuoteSync.prototype = SyncBase.prototype;
        QuoteSync.prototype.constructor = QuoteSync;

        return QuoteSync;
    });
