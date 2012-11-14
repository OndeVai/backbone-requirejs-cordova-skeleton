define(['appConfig'], function (appConfig) {

    if (!appConfig.test.isWebEnv) return;

    Connection = {
        UNKNOWN: 1,
        ETHERNET: 2,
        WIFI: 4,
        CELL_2G: 5,
        CELL_3G: 5,
        CELL_4G: 5,
        NONE: 5
    };

    window.PhoneGap = {};

    navigator.network = {};
    navigator.network.connection = { type: Connection.WIFI };

});
