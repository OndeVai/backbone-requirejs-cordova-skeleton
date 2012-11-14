define(['jquery', 'underscore', 'backbone', 'channel', 'appConfig'],
    function ($, _, Backbone, channel, appConfig) {

        var monthNames = ["Jan.", "Feb.", "March", "April", "May", "June",
                    "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];


        //this is English only!!

        Date.prototype.getMonthName = function () {
            return monthNames[this.getMonth()];
        };

        Date.prototype.toShortDateString = function () {
            var self = this;
            var mm = self.getMonth() + 1;
            var dd = self.getDate();
            var yyyy = self.getFullYear();
            return mm + '/' + dd + '/' + yyyy;
        };

        var pad = function (n) {
            return n < 10 ? '0' + n : n;
        };

        Date.prototype.toLocalISOString = function () {


            // ISO 8601
            var d = this,
                tz = d.getTimezoneOffset(),
                tzs = (tz > 0 ? "-" : "+") + pad(parseInt(tz / 60));

            if (tz % 60 != 0)
                tzs += pad(tz % 60);

            tzs += ':00';

            if (tz === 0) // Zulu time == UTC
                tzs = 'Z';

            return d.getFullYear() + '-'
                + pad(d.getMonth() + 1) + '-'
                + pad(d.getDate()) + 'T'
                + pad(d.getHours()) + ':'
                + pad(d.getMinutes()) + ':'
                + pad(d.getSeconds()) + tzs;
        };

        Date.fromYYYYString = function (s) {
            var match = s.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
            return new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
        };


        Date.prototype.toYYYYString = function (s) {
            var d = this;
            return d.getFullYear() + '-'
                + pad(d.getMonth() + 1) + '-'
                + pad(d.getDate()) + ' '
                + pad(d.getHours()) + ':'
                + pad(d.getMinutes()) + ':'
                + pad(d.getSeconds());
        };

        String.prototype.substringElipsis = function (max) {
            var elipsis = '...';
            return this.length > max ? this.substring(0, max - elipsis.length) + elipsis : this;
        };

        Backbone.View.prototype.close = function () {
            this.remove();
            this.unbind();
            if (this.onClose) {
                this.onClose();
            }
        };

        Backbone.historyRefresh = function () {
            var newFragment = Backbone.history.fragment;
            Backbone.history.fragment = null;
            Backbone.history.navigate(newFragment, { trigger: true, replace: true });
        };

        $.touchOrClickEvent = function () {
            return ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
        };

        $.touchEndOrClickEvent = function () {
            return ('ontouchend' in document.documentElement) ? 'touchend' : 'click';
        };

        $.fn.touchOrClick = function (callback) {

            var evt = $.touchOrClickEvent();

            return this.each(function () {
                var self = $(this);
                self.bind(evt, callback);
            });
        };

        $.ajaxSetup({
            timeout: 60 * 1000
        });
        
        window.deepLinkNews = function(newsId){
        	Backbone.history.navigate('news/' + newsId, { trigger: true });
        }

        window.profile = function (startDate, opp) {

            if (!appConfig.test.logSync) return;
            
            var dif = new Date().getTime() - startDate.getTime();
            var secondsFromT1ToT2 = dif / 1000;
            var secondsBetweenDates = Math.abs(secondsFromT1ToT2);
            var msg = opp + ' took ' + secondsBetweenDates + ' seconds';
            console.log(msg);
        };

    });