define(['underscore', 'backbone', 'text!templates/a_shared/rodeos/rodeo.html'],
    function (_, Backbone, rodeoTemplate) {

        return Backbone.View.extend({

            tagName: 'li',

            template: _.template(rodeoTemplate),

            render: function (event) {
                this.$el.html(this.template(this.model.toJSON()));

                return this;
            }
        });
    });