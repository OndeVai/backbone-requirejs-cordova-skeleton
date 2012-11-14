require.config({
    //path mappings for module names not found directly under baseUrl
    paths: {
        jquery: 'libs/jquery/jquery-1.7.2.min',
        jqueryBlockUI: 'libs/jquery/jquery.blockUI.min',
        jquerySelectMenu: 'libs/jquery/jquery.selectMenu', 
        jquerySwipeSlider: 'libs/jquery/jquery.swipeSlider',
        photoGallery: 'libs/photoSwipe/gallery',
        underscore: 'libs/underscore/underscore_amd',
        backbone: 'libs/backbone/backbone_amd',
        backboneWebSql: 'libs/backbone/backbone-websql',
        text: 'libs/require/text'
    },
	waitSeconds: 500
});

define(['app', 'utils/test/testSync'], function (App) {

    App.initialize();

});