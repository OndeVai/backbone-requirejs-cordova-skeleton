define(['underscore', 'backbone', 'appConfig'], function (_, Backbone, appConfig) {
    return Backbone.Collection.extend({
        fetch: function (options) {

            options || (options = {});

            var oldCallback = options.success;
            var self = this;

            options.success = function (res) {

                self.currentSeason = appConfig.getCurrentSeasonForUser();
               
                self.each(function (item) {
                    item.set('CurrentSeason', self.currentSeason);
                });

              
                oldCallback.call(options, self.toJSON());
            };

            

            return Backbone.Collection.prototype.fetch.call(this, options);
        }
    });
});