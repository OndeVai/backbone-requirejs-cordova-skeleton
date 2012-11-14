define(['jquery', 'underscore', 'backbone', 'utils/device/deviceInfo', 'text!templates/a_shared/offline/offline.html'],
    function ($, _, Backbone, deviceInfo, offlineTemplate) {

        return Backbone.View.extend({
            toggleResults: function (resultsEle, noResultsEle) {
                if (!this.collection.length) {
                    resultsEle.hide();
                    noResultsEle.show();
                }
                else {
                    resultsEle.show();
                    noResultsEle.hide();
                }
            },

            togglePager: function (pagerEle) {
                pagerEle.css('display', !this.collection.hasMorePages ? 'none' : 'block');

            },

            templateOffline: _.template(offlineTemplate),

            toggleOnline: function () {
                var isOnline = deviceInfo.isOnline();
                if (!isOnline) {
                    this.$el.html(this.templateOffline);
                    this.$('.refresh').touchOrClick(function (e) {
                        e.preventDefault();
                        Backbone.historyRefresh();
                    });
                }

                return isOnline;
            },

            refreshScrolling: function () {

                if (!deviceInfo.isAndroid()) return;
                var self = this;
                window.setTimeout(function () {
                    //$('body').height(self.$el.height());
                    $('#page').height(self.$el.height());
                }, 500);
            },

            _persist: function (val, key) {
               
                var localStorage = window.sessionStorage;

                if (val) {
                    localStorage.setItem(key, JSON.stringify(val));
                    return;
                }

                var stored = localStorage.getItem(key);
                if (stored) return JSON.parse(stored);
                return {};
            }
        });
    });