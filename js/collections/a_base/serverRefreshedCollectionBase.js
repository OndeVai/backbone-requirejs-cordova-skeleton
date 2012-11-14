define(['underscore', 'backbone', 'collections/a_base/serverRefreshedMixin'], function (_, Backbone, serverRefreshedMixin) {
    var MyCollection = Backbone.Collection.extend();

    _.extend(MyCollection.prototype, serverRefreshedMixin);

    return MyCollection;
});