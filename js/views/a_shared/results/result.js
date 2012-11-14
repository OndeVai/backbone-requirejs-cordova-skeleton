define(['underscore', 'backbone', 'text!templates/a_shared/results/result.html'],
    function (_, Backbone, resultTemplate) {

        return Backbone.View.extend({

            tagName: 'tr',

            template: _.template(resultTemplate),

            render: function () {
                var modelJson = this.model.toJSON();
                this.$el.html(this.template(modelJson));
                if (modelJson.index % 2 === 0)
                    this.$el.addClass('even');

                return this;
            }
        });
    });