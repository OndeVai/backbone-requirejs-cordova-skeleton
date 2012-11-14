define(['underscore', 'backbone', 'channel', 'backboneWebSql'], function (_, Backbone, channel) {
    return Backbone.Collection.extend({
        sync: Backbone.syncServer,
        fetch: function (options) {

            var self = this;
            
            channel.trigger('app:comm:start');

            options || (options = {});

            var oldSuccess = options.success;

            options.success = function (res) {
                oldSuccess.call(options, self.toJSON());
                channel.trigger('app:comm:stop');
            };

            var olderror = options.error;

            options.error = function (err) {
                
                if(olderror)
                    olderror.call(options, err);
                
                channel.trigger('app:comm:error');
            };

            return Backbone.Collection.prototype.fetch.call(this, options);
        }
    });
});