define(['jquery',
         'underscore',
        'backbone',
        'collections/tweets',
        'channel',
        'utils/device/deviceInfo',
        'appConfig'
       ],
    function ($, _, Backbone, Tweets, channel, deviceInfo, appConfig) {

        var AppView = function () {

            var container = $('#wrapper');
            var page = container.parent();
            var template = $('#panel-template').html();
            var templateAd = $('#ad-template').html();
            var loader = $('#loader');
            var activePanel = container.find('.panels');
            var menu = $('#menu-block');
            var currentView;
            var backLinkSelector = '.link-back';
            var isFromMenu = false;
            var isBackGesture = false;
            var cancelSlide = false;
            var loaderPos;

            var setupLoaderPositioning = function () {

                var loaderOffset = Math.round(loader.height() / 2);

                page.on('touchstart click', 'a, li', function (e) {

                    if (!e.originalEvent) return;

                    var touches = e.originalEvent.touches;

                    if (!touches || !touches.length)
                        touches = e.originalEvent.changedTouches;

                    if (touches && touches.length)
                        loaderPos = touches[0].pageY - loaderOffset;

                    if (loaderPos <= 0)
                        loaderPos = loaderOffset;
                });
            };


            var setUpCommUi = function () {

                channel.on('app:comm:start', function () {

                    if (loaderPos)
                        loader.css('top', loaderPos + 'px');

                    loader.show();

                    container.find('.error').hide();

                });

                channel.on('app:comm:stop', function () {

                    window.setTimeout(function () {
                        loader.hide();
                    }, 100);
                });


                channel.on('app:comm:error', function () {

                    container.find('.error').show();
                    scrollTop();
                    loader.hide();

                });

            };



            var isMenuActive = function () {
                return menu.hasClass('active');
            };



            var setupMenuNav = function () {

                var evt = $.touchOrClickEvent();

                page.on(evt, '.btn-menu', function (e) {

                    e.preventDefault();

                    var isActive = isMenuActive();
                    var panelMove = isActive ? '0' : menu.outerWidth() + 'px';

                    menu.toggleClass('active');

                    activePanel.bind('webkitTransitionEnd', function () {
                        if (!isMenuActive()) {
                            menu.hide();
                        }
                    });

                    menu.show(100, function () {
                        moveX(activePanel, panelMove);
                    });
                });

                page.on(evt, '.btn-back', function (e) {
                    isBackGesture = true;
                    //isFromMenu = true;
                });

                menu.find('a[data-href]').touchOrClick(function () {

                    var menuNav = page.find('.btn-menu');

                    if ($(this).attr('data-href') === Backbone.history.fragment)
                        menuNav.trigger($.touchOrClickEvent());

                    else
                        isFromMenu = true;

                });
            };


            var setMainAppElements = function (view, newPanel) {

                //set content

                newPanel.html(template);

                newPanel.appendTo(container);
                newPanel.find('.heading').after(view.$el.addClass('main'));

                var appMeta = view.appMeta;

                //set the ad banner if there is one & user is online

                var adBanner = newPanel.find('.advert');
                if (adBanner.length) {
                    
                    adBanner.css('visibility','hidden');

                    if (deviceInfo.isOnline()) {

                        var adContent = templateAd
                            .replace(/\{0\}/g, adBanner.attr('data-ad-code'))
                            .replace(/\{1\}/g, adBanner.attr('data-ad-zone'));
                        adBanner.html(adContent);
                        //android hack to prevent touchend event from firing on this element from previous screen
                        window.setTimeout(function () {
                            adBanner.css('visibility', 'visible');

                        }, 1000);
                    }
                }

                //set heading and back nav


                var heading = appMeta.heading + (appConfig.test.testVer || '');
                newPanel.find('.heading h1').html(heading);

                var backRoute = appMeta.backRoute;
                var backNav = newPanel.find(backLinkSelector);

                if (backRoute !== null && backRoute !== undefined) {

                    backNav.show();

                    backNav.touchOrClick(function (e) {

                        e.preventDefault();
                        isBackGesture = true;

                        if (window.history.length > 1) window.history.back();
                        else Backbone.history.navigate(backRoute, { trigger: true, replace: true });

                    });
                }
                else {
                    backNav.hide();
                }
            };

            var recordTouchMove = function (ele) {
                ele.data('isScroll', true);

            };

            var wasTouchMove = function (ele) {

                if (ele.data('isScroll')) {
                    ele.removeData('isScroll');
                    return true;
                }

                return false;
            };

            var placeAnchorHooks = function () {

                var evt = $.touchEndOrClickEvent();

                page.on('touchmove', '[data-href]', function (e) {

                    recordTouchMove($(this));
                });

                page.on(evt, '[data-href]', function (e) {

                    e.preventDefault();

                    var self = $(this);
                    window.setTimeout(function () {

                        if (wasTouchMove(self)) return;
                        Backbone.history.navigate('#' + self.attr('data-href'), { trigger: true });
                    }, 100);


                });

                channel.on('app:nav', function (route) {
                    Backbone.history.navigate('#' + route, { trigger: true });
                });

                channel.on('app:nav:refresh', function (route) {
                    cancelSlide = true;
                    Backbone.historyRefresh();
                });
            };

            var setupTouchBands = function () {

                var touchBands = '.news-list li';

                page.on('touchmove', touchBands, function (e) {

                    recordTouchMove($(this));
                });

                page.on('touchend', touchBands, function (e) {



                    var self = $(this);
                    window.setTimeout(function () {

                        if (wasTouchMove(self)) return;

                        var href = self.find('a[data-href]').first().attr('data-href');

                        if (href) {
                            self.addClass('active');
                            channel.trigger('app:nav', href);
                        }
                    }, 100);

                });
            };

            var origHeight = menu.height();
            var cleanupViews = function (view, newPanel, oldPanel) {

                if (currentView)
                    currentView.close();

                newPanel.removeClass('new');
                oldPanel.remove();
                currentView = view;

                menu.hide();
                var newPanelHeight = newPanel.height();
                var newHeight = newPanelHeight > origHeight ? newPanelHeight : origHeight;
                menu.css('height', newHeight + 'px');

                var scrollTo = currentView.appMeta && currentView.appMeta.scrollTo;
                if (scrollTo !== undefined && scrollTo !== null) {
                    window.setTimeout(function () {
                        //alert('scrolltop');
                        scrollTop(scrollTo);
                    }, 200);
                }
            };

            var setLatestTweet = function () {

                var latestTweetEle = menu.find('.latest-tweet');
                var tweets = new Tweets();
                tweets.fetch({
                    quiet: true,
                    success: function () {
                        var lastestTweet = tweets.first();
                        if (lastestTweet && lastestTweet.get('Text'))
                            latestTweetEle.html(lastestTweet.get('Text'));
                        else
                            latestTweetEle.text('Currently no Tweets');
                    }
                });
            };

            var scrollTop = function (to) {

                $('body, #page').animate({ scrollTop: (to || 0) }, 300);


            };

            var moveX = function (ele, x) {
                ele.css('-webkit-transform', 'translate3d(' + x + ',0,0)');
            };


            this.showView = function (view) {

                container.find('.error').hide();

                if (cancelSlide) {
                    cancelSlide = false;
                    window.setTimeout(function (parameters) {
                        setMainAppElements(view, activePanel);
                    }, 200);
                    return;
                }

                var newPanelStart = isBackGesture ? '-100%' : '100%';
                var oldPanelMove = isBackGesture ? '100%' : '-100%';

                var newPanel = $('<div class="panels new"></div>');

                moveX(newPanel, newPanelStart);
                setMainAppElements(view, newPanel);

                var oldPanel = activePanel;
                activePanel = newPanel;

                newPanel.one('webkitTransitionEnd', function () {
                    cleanupViews(view, newPanel, oldPanel);

                });

                //this is needed b/c of bug with transitions for newly added items
                window.setTimeout(function () {
                    moveX(newPanel, '0');
                    if (!isFromMenu)
                        moveX(oldPanel, oldPanelMove);

                    isFromMenu = false;
                    isBackGesture = false;
                }, 0);

                menu.removeClass('active');
                setLatestTweet();
            };

            setupLoaderPositioning();
            setupMenuNav();
            placeAnchorHooks();
            setupTouchBands();
            setUpCommUi();

            channel.trigger('app:comm:stop');
        };


        return AppView;
    });
