define(['jquery',
        'libs/photoSwipe/klass.min',
        'libs/photoSwipe/code.photoswipe-3.0.5.min'],
    function ($) {

        var Gallery = function (images) {

            var options = {
                getImageSource: function (obj) {
                    return obj.url;
                },
                getImageCaption: function (obj) {
                    return obj.caption;
                },
                backButtonHideEnabled: false
            };

            return window.Code.PhotoSwipe.attach(images, options);
        };

        return Gallery;
       
    });