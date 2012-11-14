define(['jquery',
        'underscore',
        'backbone',
        'views/appView',
        'views/home/home',
        'views/news/newsItems',
        'views/news/newsItemDetail',
        'views/nfr/home',
        'views/nfr/goRounds',
        'views/nfr/results',
        'views/nfr/videos',
        'views/nfr/injuryReports',
        'views/nfr/standingsTopGun',
        'views/results_standings/home',
        'views/results_standings/rodeos',
        'views/results_standings/results',
        'views/results_standings/standingTypes',
        'views/results_standings/standings',
        'views/schedules/home',
        'views/schedules/rodeos',
        'views/schedules/events',
        'views/schedules/tvs',
        'views/social/home',
        'views/about/home',
        'views/about/prca',
        'views/about/rodeo101',
        'views/about/livestock',
        'channel',
        'appConfig'

    ],
	function (
	    $,
	    _,
	    Backbone,
	    AppView,
	    HomeView,
	    NewsItemsView,
	    NewsItemDetailView,
	    NfrHomeView,
	    NfrGoRoundsView,
	    NfrResultsView,
	    NfrVideosView,
	    NfrInjuryReportsView,
	    NfrStandingsTopGunsView,
	    ResultsStandingsHomeView,
        ResultsStandingsRodeosView,
        ResultsStandingsResultsView,
        ResultsStandingsStandingTypesView,
        ResultsStandingsStandingsView,
        SchedulesHomeView,
	    SchedulesRodeosView,
	    SchedulesEventsView,
	    SchedulesTvsView,
	    SocialHomeView,
	    AboutHomeView,
	    AboutPrcaView,
	    AboutRodeo101View,
	    AboutLivestockView,
	    channel,
	    appConfig
        ) {

	    //todo error handling for all views!!!
	    //todo refactor show view code using "after" syntax

	    var AppRouter = Backbone.Router.extend({ //todo add error views for all of these
	        routes: {
	            '': 'home',
	            'news': 'news',
	            'news/:id': 'newsDetail',
	            'nfr': 'nfrHome',
	            'nfr/results': 'nfrGoRounds',
	            'nfr/results/:rodeoId/:goRoundId': 'nfrResults',
	            'nfr/video-recap': 'nfrVideos',
	            'nfr/injury-reports': 'nfrInjuryReports',
	            'nfr/top-gun': 'nfrStandingsTopGuns',
	            'results-standings': 'resultsStandingsHome',
	            'results-standings/results': 'resultsStandingsRodeos',
	            'results-standings/results-list/:id': 'resultsStandingsResults',
	            'results-standings/standings': 'resultsStandingsStandingTypes',
	            'results-standings/standings/circuit/:circuitId/season/:season': 'resultsStandingsStandingsByCircuit',
	            'results-standings/standings/standing-type/:standingTypeId/season/:season': 'resultsStandingsStandingsByStandingType',
	            'schedules': 'schedulesHome',
	            'schedules/rodeos': 'schedulesRodeos',
	            'schedules/events': 'schedulesEvents',
	            'schedules/tv': 'schedulesTv',
	            'social': 'socialHome',
	            'about': 'aboutHome',
	            'about/prca': 'aboutPrca',
	            'about/rodeo-101': 'aboutRodeo101',
	            'about/livestock-welfare': 'aboutLivestock'
	        },
	        initialize: function (options) {

	            // _.bindAll(this, 'home', 'news');
	            this.appView = options.appView;

	        },
	        home: function () {
				
	            if (window.newsId) {
	                var thisNewsId = window.newsId;
	                window.newsId = null;
	               	window.deepLinkNews(thisNewsId);
	                return;
	            }

	            var homeView = new HomeView();

	            var self = this;
	            homeView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(homeView);
	                },
	                error: viewError
	            });
	        },
	        news: function () {

	            var newsItemsView = new NewsItemsView();

	            var self = this;
	            newsItemsView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(newsItemsView);
	                },
	                error: viewError
	            });
	        },
	        newsDetail: function (id) {

	            var newsItemDetailView = new NewsItemDetailView();

	            var self = this;
	            newsItemDetailView.fetchAndRender({ id: id,
	                success: function () {
	                    self.appView.showView(newsItemDetailView);
	                },
	                error: viewError
	            });
	        },
	        nfrHome: function () {
	            var homeView = new NfrHomeView();
	            this.appView.showView(homeView.render());
	        },
	        nfrGoRounds: function () {

	            var goRoundsView = new NfrGoRoundsView();

	            var self = this;
	            goRoundsView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(goRoundsView);
	                },
	                error: viewError
	            });
	        },
	        nfrResults: function (rodeoId, goRoundId) {

	            var nfrResultsView = new NfrResultsView();

	            var self = this;
	            nfrResultsView.fetchAndRender({
	                data: { rodeoId: rodeoId, goRoundId: goRoundId },
	                success: function () {
	                    self.appView.showView(nfrResultsView);
	                },
	                error: viewError
	            });
	        },
	        nfrVideos: function () {

	            var nfrVideosView = new NfrVideosView();

	            var self = this;
	            nfrVideosView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(nfrVideosView);
	                },
	                error: viewError
	            });
	        },
	        nfrInjuryReports: function () {

	            var nfrInjuryReportsView = new NfrInjuryReportsView();

	            var self = this;
	            nfrInjuryReportsView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(nfrInjuryReportsView);
	                },
	                error: viewError
	            });
	        },
	        nfrStandingsTopGuns: function () {

	            var nfrStandingsTopGunsView = new NfrStandingsTopGunsView();

	            var self = this;
	            nfrStandingsTopGunsView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(nfrStandingsTopGunsView);
	                },
	                error: viewError
	            });
	        },
	        resultsStandingsHome: function () {
	            var homeView = new ResultsStandingsHomeView();
	            this.appView.showView(homeView.render());
	        },

	        resultsStandingsRodeos: function (params) {

	            var resStandRodeosView = new ResultsStandingsRodeosView();
	             var self = this;
	            resStandRodeosView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(resStandRodeosView);
	                },
	                error: viewError
	            });
	        },
	        resultsStandingsResults: function (rodeoId) {


	            var resultsStandingsResultsView = new ResultsStandingsResultsView();

	            var self = this;
	            resultsStandingsResultsView.fetchAndRender({
	                data: { rodeoId: rodeoId },
	                success: function () {
	                    self.appView.showView(resultsStandingsResultsView);
	                },
	                error: viewError
	            });
	        },
	        resultsStandingsStandingTypes: function () {

	            var resultsStandingsStandingTypesView = new ResultsStandingsStandingTypesView();

	            var self = this;
	            resultsStandingsStandingTypesView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(resultsStandingsStandingTypesView);
	                },
	                error: viewError
	            });
	        },
	        resultsStandingsStandingsByCircuit: function (circuitId, season) {

	            this._resultsStandingsStandings({ circuitId: circuitId, season: season });
	        },
	        resultsStandingsStandingsByStandingType: function (standingTypeId, season) {

	            this._resultsStandingsStandings({ standingTypeId: standingTypeId, season: season });
	        },
	        _resultsStandingsStandings: function (data) {

	            var resultsStandingsStandingsView = new ResultsStandingsStandingsView();

	            var self = this;
	            resultsStandingsStandingsView.fetchAndRender({
	                data: data,
	                success: function () {
	                    self.appView.showView(resultsStandingsStandingsView);
	                },
	                error: viewError
	            });
	        },
	        schedulesHome: function () {
	            var homeView = new SchedulesHomeView();
	            this.appView.showView(homeView.render());
	        },
	        schedulesRodeos: function () {

	            var schedRodeosView = new SchedulesRodeosView();

	            var self = this;
	            schedRodeosView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(schedRodeosView);
	                },
	                error: viewError
	            });
	        },
	        schedulesEvents: function () {

	            var schedEventsView = new SchedulesEventsView();

	            var self = this;
	            schedEventsView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(schedEventsView);
	                },
	                error: viewError
	            });
	        },
	        schedulesTv: function () {

	            var schedTvsView = new SchedulesTvsView();

	            var self = this;
	            schedTvsView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(schedTvsView);
	                },
	                error: viewError
	            });
	        },
	        socialHome: function () {

	            var socialHomeView = new SocialHomeView();

	            var self = this;
	            socialHomeView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(socialHomeView);
	                },
	                error: viewError
	            });
	        },
	        aboutHome: function () {
	            var homeView = new AboutHomeView();
	            this.appView.showView(homeView.render());
	        },
	        aboutPrca: function () {
	            var prcaView = new AboutPrcaView();
	            this.appView.showView(prcaView.render());
	        },
	        aboutRodeo101: function () {
	            var rodeo101View = new AboutRodeo101View();
	            this.appView.showView(rodeo101View.render());
	        },
	        aboutLivestock: function () {
	            var livestockView = new AboutLivestockView();
	            this.appView.showView(livestockView.render());
	        }
	    });


	    //blank for now, handled in appview
	    var viewError = function () {

	    };



	    var trackPageView = function () {

	        var ga = window._gaq || [];

	        ga.push(['_setAccount', appConfig.analytics.account]);
	        ga.push(['_setDomainName', 'none']);
	        ga.push(['_trackPageview', '/' + Backbone.history.fragment]);
	    };

	    var initialize = function () {

	        var appRouter = new AppRouter({ appView: new AppView() });
	        //placeAnchorHooks(appRouter);

	        appRouter.bind('all', function (trigger, args) {
	           
	            trackPageView();
	        });

	        Backbone.history.start({ pushState: false });
	    };

	    return {
	        initialize: initialize
	    };
	});

