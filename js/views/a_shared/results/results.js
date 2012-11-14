define(['jquery', 'underscore', 'backbone',
        'views/a_base/dataResultsViewBase',
        'views/a_shared/results/result', 'collections/results',
        'models/rodeo',
        'text!templates/a_shared/results/results.html',
        'text!templates/a_shared/results/resultsHeader.html',
        'appConfig', 'jquerySelectMenu'],
    function ($, _, Backbone, DataResultsViewBase, ResultView, Results, Rodeo, resultsTemplate,
                resultsTemplateHeader, appConfig) {
        return DataResultsViewBase.extend({

            tagName: 'div',
            className: 'table',
            template: _.template(resultsTemplate),
            templateHeader: _.template(resultsTemplateHeader),

            initialize: function () {
                _.bindAll(this, 'render', 'renderItem', 'fetchAndRender', 'renderResults', 'renderFilters');
            },

            render: function (event) {


                this.renderFilters();
                this.renderResults();

                return this;
            },

            renderItem: function (result, index) {
                result.set({ renderData: this.renderData, event: this.resEvent, index: index + 1 });
                this.$('.results').append(new ResultView({ model: result }).render().el);
            },

            renderResults: function () {

                this.toggleResults(this.$('.results-grid'), this.$('.no-results'));

                this.$('.results').empty();
                this.collection.each(this.renderItem);
                var self = this;
                var header = this.templateHeader({
                    renderData: self.renderData,
                    event: self.resEvent,
                    rodeo: self.rodeo
                });
                this.$('.results-header').html(header);
            },

            renderFilters: function () {

                if (this.filtersRendered) return;

                this.$el.html(this.template({ renderData: this.renderData, event: this.resEvent, rodeo: this.rodeo }));

                var self = this;

                this.$('.filter-events').change(function (value) {

                    self.setThisEventByCode($(this).val());
                    self.fetchAndRenderResults();
                });

                this.filtersRendered = true;
            },

            setThisEventByCode: function (eventCode) {
                var reEvt = _(this.rodeo.Events).find(function (e) {
                    return e.EventCode == eventCode;
                });
                this.setThisEvent(reEvt);

            },

            setThisEvent: function (event) {

                this.optData.eventCode = event.EventCode;
                this.resEvent = event;

                this.renderData.isTimed = event.EventType == appConfig.event.type.timed;
                this.renderData.isScored = event.EventType == appConfig.event.type.scored;
                this.renderData.isAllAround = event.EventType == appConfig.event.type.allAround;

                this.renderData.isTeamEvent = event.EventCode == appConfig.event.teamRopingCode;
            },

            fetchAndRenderResults: function (callback) {

                if (!this.toggleOnline()) {
                    callback();
                    return;
                }

                var self = this;
                this.collection = new Results(this.optData);
                this.collection.fetch({
                    success: function () {
                        self.render();
                        if (callback)
                            callback();
                    }
                });
            },

            setViewMode: function () {

                this.renderData = {};

                if (this.optData.goRoundId) {
                    this.renderData.viewMode = 'goRound';
                    this.renderData.isOverall = this.optData.goRoundId == appConfig.goRound.overallId;
                }

                else
                    this.renderData.viewMode = 'rodeo';

            },

            fetchRodeo: function (options) {


                var model = new Rodeo({ Id: options.data.rodeoId });

                var dfd = $.Deferred();

                var self = this;
                model.fetch({
                    success: function (res) {
                        self.rodeo = model.toJSON();
                        dfd.resolve(res);
                    },
                    error: function (error) {
                        options.error(error);
                        dfd.reject(error);
                    }
                });
                return dfd.promise();
            },

            fetchAndRender: function (options) {

                var self = this;
                this.optData = options.data;
                this.setViewMode();

                var dfd = $.Deferred();

                $.when(this.fetchRodeo(options))
                    .done(function () {

                        if (!options.data.eventCode)
                            self.setThisEvent(self.rodeo.Events[0]);
                        else
                            self.setThisEventByCode(options.data.eventCode);

                        self.fetchAndRenderResults(function () { //errors will be handled with global ajax error handler
                            dfd.resolve();
                        });
                    })
                    .fail(dfd.reject);

                return dfd.promise();

            }
        });
    });
	