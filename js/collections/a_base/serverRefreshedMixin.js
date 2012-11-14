define(['underscore', 'backbone'], function (_, Backbone) {
    return {
        initialize: function (options) {
            options || (options = {});
            this.lastUpdate = options.lastUpdate;
        },
        url: function () {
            return this.lastUpdate ? this.urlRoot + '?lu=' + this.lastUpdate.toLocalISOString() : this.urlRoot;
        }
    };
});