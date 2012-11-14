define([], function () {

    function isOnline() {

        var networkState = navigator.network.connection.type;
        return networkState != Connection.UNKNOWN && networkState != Connection.NONE;
    }

    function needsFiltersFix() {
    
       var pgDevice = window.device;
       if(!pgDevice || !isAndroid()) return false;
       
       var version = pgDevice.version || '';
        
       return version.indexOf('4') === 0;
    
      
    }

    function isAndroid() {

        function isAndroidOS() {
          return inUserAgent('android') || inUserAgent('htc_') || inUserAgent('silk/');
        }

        function isAndroidPG() {
          return (window.device && window.device.platform && window.device.platform == 'Android') || false;
        }
        
        function inUserAgent(s) {
            var ua = navigator.userAgent.toLowerCase();
            return ua.indexOf(s) > -1;
        }

        return isAndroidOS() || isAndroidPG();
  }

    return { isOnline: isOnline, isAndroid : isAndroid, needsFiltersFix : needsFiltersFix };
});