define(['jquery', 'underscore', 'backbone', 'views/a_base/dataResultsViewBase', 'views/a_shared/rodeos/rodeo',
        'collections/rodeos', 'text!templates/a_shared/rodeos/rodeos.html', 'appConfig', 'jquerySelectMenu'],
    function ($, _, Backbone, DataResultsViewBase, RodeoView, Rodeos, rodeosTemplate, appConfig) {
        return DataResultsViewBase.extend({

            tagName: 'section',
            template: _.template(rodeosTemplate),

            initialize: function () {

                _.bindAll(this, 'render', 'renderItem', 'fetchAndRender', 'fetchAndRenderResults',
                                'renderFilters', 'renderFilterList', 'fetchAndRenderResultsFromControls');
            },

            render: function (event) {

                this.renderFilters();

                if (this.currentPageNo === 1) {

                    var rodeosList = this.$('.rodeos');
                    rodeosList.empty();
                    var noRodeos = this.$('.no-rodeos');

                    this.toggleResults(rodeosList, noRodeos);
                }

                this.togglePager(this.$('.pager'));

                this.collection.each(this.renderItem);

                this.refreshScrolling();

                return this;
            },
            renderFilters: function () {

                if (this.filtersRendered) return;

                this.$el.html(this.template(this.filterData));

                this.filterCities = this.renderFilterList('.filter-cities');
                this.filterStates = this.renderFilterList('.filter-states');
                this.filterMonths = this.renderFilterList('.filter-months');

                //paging
                var self = this;
                this.$('.pager').bind($.touchEndOrClickEvent(), function (evt) {
                    evt.preventDefault();
                    self.currentPageNo++;
                    self.fetchAndRenderResultsFromControls();

                });

                this.$('.header-text').text(this.headerText);

                //prepop
                var hasPrepop = this.optData.city || this.optData.stateName || this.optData.month;

                this.filterCities.val(this.optData.city);
                this.filterStates.val(this.optData.stateName);
                this.filterMonths.val(this.optData.month);


                this.$('.filter-show').selectMenuAccordion(this.$('.filter-container'), hasPrepop);

                //this._prePopFilters({});

                this.filtersRendered = true;
            },
            renderFilterList: function (eleSelector) {

                var self = this;
                var filter = this.$(eleSelector);
                filter.change(function () {
                    self.currentPageNo = 1;
                    self.fetchAndRenderResultsFromControls();
                });

                return filter;
            },
            renderItem: function (rodeo) {
                rodeo.set({ RodeoId: this.RodeoId, Mode: this.viewMode });
                this.$('.rodeos').append(new RodeoView({ model: rodeo }).render().el);
            },

            fetchAndRender: function (options) {

                if (!this.collection)
                    this.collection = new Rodeos();

                var self = this;
                $.when(this.collection.fetchStates(options), this.collection.fetchCities(options))
                    .then(function (states, cities) {


                        self.filterData = { cities: cities, states: states };
                        if (!self.viewMode)
                            self.viewMode = self.filterData.viewMode = options.mode;
                        _.extend(options, self._prePopFilters());
                        self.fetchAndRenderResults(options);
                    }, options.error);
            },
            fetchAndRenderResultsFromControls: function () {
                var self = this;
                var flData = {
                    city: self.filterCities.val(),
                    stateName: self.filterStates.val(),
                    month: self.filterMonths.val()
                };
                self.fetchAndRenderResults(flData);
                this._prePopFilters(flData);

            },
            fetchAndRenderResults: function (options) {
                var self = this;

                this.optData = options;

                this.headerText = options.headerText;



                if (!this.currentPageNo)
                    this.currentPageNo = options.pageNo || 1;

                this.collection.fetchByPage({
                    pageNo: self.currentPageNo,
                    pageSize: appConfig.ui.rodeos.pageSize,
                    stateName: options.stateName,
                    city: options.city,
                    month: options.month,
                    mode: self.viewMode,
                    success: function () {

                        if (options.success)
                            options.success(self.render());
                        else
                            self.render();
                    },
                    error: function (error) {
                        if (options.error)
                            options.error(error);
                    }
                });
            },
            _prePopFilters: function (val) {
                var append = this.viewMode || '';
                return this._persist(val, 'prcaRodeoFilters' + append);
            }


        });
    });
	