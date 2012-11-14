define(['jquery', 'libs/swipe/swipe.min'], function ($) {

    $.fn.swipeSlider = function (options) {

        options = options || { width: 250 };
        
        var positionContainer = options.positionContainer;
        var activeClass = 'active';
        
        options.callback = function (e, pos) {

            var bullets = positionContainer.find('li');

            bullets.each(function (index) {

                if (index == pos)
                    $(this).addClass(activeClass);
                else
                    $(this).removeClass(activeClass);

            });
        };

        var bulletTemplate = '<li><a href="#slide-{0}">{0}</a></li>';

        return this.each(function () {

            positionContainer.empty();
            
            var self = $(this);
            self.find('ul li').each(function (index) {
                
                var thisBullet = $(bulletTemplate.replace('{0}', index));
                if (index === 0) thisBullet.addClass(activeClass);
                positionContainer.append(thisBullet);
            });

            self.css('width', options.width + 'px');
            window.setTimeout(function () {
                new window.Swipe(self[0], options);
            }, 0);
        });
    };


});
