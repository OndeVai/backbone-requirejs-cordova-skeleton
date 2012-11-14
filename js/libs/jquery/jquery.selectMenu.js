define(['jquery', 'utils/device/deviceInfo'], function ($, deviceInfo) {


    $.fn.selectMenuAccordion = function (filterContainer, hasPrepop, clickCallback) {

        var needsFiltersFix = deviceInfo.needsFiltersFix();
        var activeClass = 'active';
        
        return this.each(function () {

            var self = $(this);
            var filterToggler = self.find('a');
           
            filterToggler.addClass(activeClass);

            filterToggler.touchOrClick(function (e) {
                
                e.preventDefault();
                filterContainer.toggle();
                $(this).toggleClass(activeClass);
                if (clickCallback) {
                    
                    e.isActive = $(this).hasClass(activeClass);
                    clickCallback(e);
                }
            });

            var timeout = needsFiltersFix ? 2000 : 0;

            if (hasPrepop) return;

            window.setTimeout(function () {
                filterContainer.hide();
                filterToggler.removeClass(activeClass);
            }, timeout);

        });
    };
});
