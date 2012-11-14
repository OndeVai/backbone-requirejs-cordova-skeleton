define(['jquery', 'backboneWebSql', 'appConfig', 'channel'],
    function ($, WebSQLStore, appConfig, channel) {

        if (!appConfig.test.isWebEnv) return;

        var tester = (function () {

          
            
            //#region testonly

            var clear = function () {

                window.localStorage.clear();

                WebSQLStore.db.transaction(
                    function (tx) {

                        tx.executeSql('DROP TABLE IF EXISTS registry');
                        tx.executeSql('DROP TABLE IF EXISTS rodeo');
                        tx.executeSql('DROP TABLE IF EXISTS circuit');
                        tx.executeSql('DROP TABLE IF EXISTS eventschedule');
                        tx.executeSql('DROP TABLE IF EXISTS tvschedule');
                        tx.executeSql('DROP TABLE IF EXISTS event');
                        tx.executeSql('DROP TABLE IF EXISTS goround');
                        tx.executeSql('DROP TABLE IF EXISTS injuryreport');
                        tx.executeSql('DROP TABLE IF EXISTS news');
                        tx.executeSql('DROP TABLE IF EXISTS quote');
                        tx.executeSql('DROP TABLE IF EXISTS rodeo');
                        tx.executeSql('DROP TABLE IF EXISTS standingtype');
                        tx.executeSql('DROP TABLE IF EXISTS tweet');
                        tx.executeSql('DROP TABLE IF EXISTS video');
                        tx.executeSql('DROP TABLE IF EXISTS photo');
                    },
                    function (err) {
                        console.error('Error dropping tables in local SQLite database');
                        console.error(err);
                    },
                    function () {
                        console.log('Tables successfully DROPPED in local SQLite database');
                    }
                );
            };

            var setupTestBtn = function () {
                if ($('#clrTest').length) return;
                var btn = $('<button id="clrTest" style="font-size :20px; z-index:99; display:block; width:200px; height:100px">' +
                            'CLEAR TEST</button>');
                btn.appendTo($('body'));
                btn.click(function () {
                    clear();
                });
            };

            var setupTestBtnRefresh = function () {
                if ($('#refreshTest').length) return;
                var btn = $('<button id="refreshTest" style="font-size :20px; z-index:99; display:block; width:200px; height:100px">' +
                            'REFRESH TEST</button>');
                btn.appendTo($('body'));
                btn.click(function () {
                    channel.trigger('app:nav:refresh');
                });
            };


            return { setupTestBtn: setupTestBtn, setupTestBtnRefresh: setupTestBtnRefresh };
        })();

        tester.setupTestBtn();
        tester.setupTestBtnRefresh();
    });
        