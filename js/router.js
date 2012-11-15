define(['jquery',
        'underscore',
        'backbone',
        'views/appView',
        'views/home/home',
        'channel',
        'appConfig'

    ],
	function (
	    $,
	    _,
	    Backbone,
	    AppView,
	    HomeView,
	    
	    channel,
	    appConfig
        ) {

	    //todo error handling for all views!!!
	    //todo refactor show view code using "after" syntax

	    var AppRouter = Backbone.Router.extend({ //todo add error views for all of these
	        routes: {
	            '': 'home',
	          
	        },
	        initialize: function (options) {

	            // _.bindAll(this, 'home', 'news');
	            this.appView = options.appView;

	        },
	        home: function () {
		
	            var self = this;
	            homeView.fetchAndRender({
	                success: function () {
	                    self.appView.showView(homeView);
	                },
	                error: viewError
	            });
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

