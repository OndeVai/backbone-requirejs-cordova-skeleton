//todo determine all of these!
define([], function () {

    var appConfig = {
        test: {
            logSync: false,
            isWebEnv: !window.PhoneGap,
            testVer: ' - ver 1.5'
        },
        ui: {
            loadingGalleryTimeout: 10,
            rodeos: {
                pageSize: 20
            }
        },
        urls: {
            checkin: 'https://foursquare.com/v/las-vegas-convention-center/4d0fb027b3692d437bb235de',
            proRodeoRoot: 'http://www2.prorodeo.org/Services/ContentService.svc/',
            scoreServeRoot: 'http://stage.scores.prorodeo.org/ScoreServiceREST.svc/',
            tweets: 'http://search.twitter.com/search.json?q=from:ProRodeoOnline&rpp=5&inlude_entities=true&result_type=recent'
        },
        analytics: {
            account: 'UA-XXXXXXX'
        },
        sync: {
            interval: {
                highFreq: 1 * 60 * 15, //15 minutes
                lowFreq: 24 * 60 * 60 //Every day (adjusted to 8AM in timer)
            },
            firstTime: {
                failureMessage: 'The initial sync failed for this application. Please try again later.',
                offlineMessage: 'You are currently offline. You must be online to sync the application for the first time. Please try again later',
                lastModifiedDate: function () {

                    var defaultLastUpdate = new Date();
                    defaultLastUpdate.setDate(defaultLastUpdate.getDate() - 60); //todo make this a config value
                    return defaultLastUpdate;
                }
            },
            registryDateKeys: {
                highFreq: 'prca-lastUpdateHighFq',
                lowFreq: 'prca-lastUpdateLowFq',
                tweet: 'prca-lastUpdateTweet',
                news: 'prca-lastUpdateNews'
            }

        },
        goRound: {
            overallId: 200
        },
        rodeo: {
            nfrRodeoId: 4815
        },
        event: {
            type: {
                allAround: 2,
                timed: 1,
                scored: 0
            },

            teamRopingCode: 'TR'
        },
        standingType: {
            worldStandingId: 1
        },
        getCurrentSeasonForUser: function () {

            var fromNowDays = 63;
            var now = new Date();
            now.setDate(now.getDate() + fromNowDays);
            return now.getFullYear();
        },
        getCurrentSeasonsForUserForWorldStandings: function () {

            var now = new Date();
            var showBothStartDate = new Date(now.getFullYear(), 10 - 1, 1); //october 1st
            var showBothEndDate = new Date(now.getFullYear() + 1, 1 - 1, 31); //jan 31st

            var showBoth = now >= showBothStartDate && now <= showBothEndDate;

            var fromNowDays = 92;
            now.setDate(now.getDate() + fromNowDays);

            var seasons = [now.getFullYear()];

            if (showBoth) {
                seasons.push(now.getFullYear() - 1);
            }

            return seasons;
        }
    };

   
    return appConfig;
});
