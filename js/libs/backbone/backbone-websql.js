//todo minify
define(['jquery', 'underscore', 'backbone', 'channel'], function ($, _, Backbone, channel) {


    var db = window.openDatabase("prca_local", "1.0", "PRCA Local DB", 10499760);
    var WebSQLStore =
(function (window, Backbone, undefined) {




    var WebSQLStore = function (tableName) {
        this.tableName = tableName;
    };
    WebSQLStore.db = db;
    WebSQLStore.debug = false;
    _.extend(WebSQLStore.prototype, {

        createTable: function (model, success, error) {

            var meta = model.localStoreMeta;

            var cols = _.map(meta.expectedColumns.split(','), function (col) {
                var spl = col.split(':');
                return spl[0] + " " + spl[1];
            }).join(',');

            var tableName = meta.store;

            var sql = "CREATE TABLE IF NOT EXISTS " + tableName + " ( " + cols + ")";

            WebSQLStore.db.transaction(
                function (tx) {
                    tx.executeSql(sql);
                },
                error,
                success
            );
        },

        create: function (model, success, error, tx) {

            var vals = [];
            var plcs = [];
            var modelJson = model.toJSON();
            var colNames = _.map(model.localStoreMeta.expectedColumns.split(','), function (col) {
                var spl = col.split(':');
                return $.trim(spl[0]);
            });


            _.each(colNames, function (key) {
                var jsonVal = modelJson[key];
                if ($.isArray(jsonVal) || $.isPlainObject(jsonVal)) {
                    jsonVal = JSON.stringify(jsonVal);
                }
                vals.push(jsonVal);
                plcs.push('?');
            });

            var sql = "INSERT OR REPLACE INTO " + this.tableName + " (" + colNames.join(',') + ") " +
                      "VALUES (" + plcs.join(',') + ")";

            //console.log('Inserting or Updating in local database:' + sql);
            this._executeSql(sql, vals, success, error, tx);
        },

        destroy: function (model, success, error, tx) {
            //window.console.log("sql destroy");
            var sql = "DELETE FROM `" + this.tableName + "` WHERE(`" + model.idAttribute + "`=?);";
            this._executeSql(sql,
                [model.attributes[model.idAttribute]], success, error, tx);
        },

        deleteExpr: function (meta, vals, success, error) {

            
            var sqlWhere = '';
            var args = meta.archiveFilter.split(':');
            var targCol = args[1];
            var targVal = args[2];
            switch (args[0]) {
                case 'TTL':
                    sqlWhere = "date(" + targCol + ") < date('now','" + targVal + "')";
                    break;
                case 'LIM':
                    sqlWhere = targCol + " NOT IN (SELECT " + targCol + " FROM " + meta.store + " ORDER BY " + args[3] + " DESC LIMIT " + targVal + ")";
                    break;
            }

            var sql = "DELETE FROM " + meta.store + " WHERE " + sqlWhere;

            this._executeSql(sql, vals, success, error);
        },

        find: function (model, success, error) {
            //window.console.log("sql find");
            this._executeSql("SELECT * FROM `" + this.tableName + "` WHERE(`" + model.idAttribute + "`=?);", [model.attributes[model.idAttribute]], success, error);
        },

        findAll: function (model, success, error, data) {

            var meta = new model.model().localStoreMeta;
            var sql = "SELECT * FROM " + this.tableName;
            var sqlOrderBy = " ORDER BY " + meta.orderBy;
            var vals = [];
            var sqlWhere = null;
            var sqlLimit = meta.limit ? ' LIMIT ' + meta.limit : '';

            if (data) {
                var plcs = [];
                _.each(data, function (val, key) {
                    vals.push(val);
                    plcs.push(key + '=?');
                });
                sqlWhere = " WHERE " + plcs.join(' AND ');
            }

            if (meta.where) {
                sqlWhere = (sqlWhere ? sqlWhere + " AND " : " WHERE ") + meta.where + " ";
            }

            sql = sql + (sqlWhere || '') + sqlOrderBy + sqlLimit;

            this._executeSql(sql, vals, success, error);
        },

        findAllByExpr: function (sql, vals, success, error) {

            this._executeSql(sql, vals, success, error);
        },



        _executeSql: function (sql, params, successCallback, errorCallback, tx) {
            var success = function (tx, result) {
                if (WebSQLStore.debug) { window.console.log(sql, params, " - finished"); }
                if (successCallback) successCallback(tx, result);
            };
            var error = function (tx, error) {
                window.console.error(sql, params, " - error: " + error);
                if (errorCallback) errorCallback(tx, error);
            };


            if (tx) {
                tx.executeSql(sql, params, success, error);
            } else {
                WebSQLStore.db.transaction(function (tx1) {

                    tx1.executeSql(sql, params, success, error);
                });
            }

        }
    });

    Backbone.syncServer = Backbone.sync;


    Backbone.sync = function (method, model, options) {

        options = options || {};

        var isQuiet = options.quiet === true;

        var meta = model.localStoreMeta || new model.model().localStoreMeta;

        var store = new WebSQLStore(meta.store), success, successSingle, error;

        var triggerCommChannel = function (action) {
            //if (!isQuiet) alert('app:comm:' + action);
            if (!isQuiet && method.indexOf('read') > -1) channel.trigger('app:comm:' + action);
        };

        success = function (tx, res) {
            var len = res.rows.length, result, i;
            if (len > 0) {
                result = [];

                //loop rows
                for (i = 0; i < len; i++) {
                    result.push(convertTypes(res.rows.item(i)));
                }
            }
            options.success(result);
            triggerCommChannel('stop');
        };

        successSingle = function (tx, res) {
            var len = res.rows.length, result;
            if (len > 0) {
                result = convertTypes(res.rows.item(0));
            }
            options.success(result);
            triggerCommChannel('stop');
        };

        error = function (tx, error) {
            console.error(error);
            if (options.error)
                options.error(error);
            triggerCommChannel('error');
        };

        //todo clean this up and unify these meta functions...
        var isFieldOfType = function (m, typeName, fieldName, index) {

            //todo cache this for one time
            var metas = m.expectedColumns.split(',');
            for (var i = 0; i < metas.length; i++) {
                var col = metas[i];
                var spl = col.split(':');
                var fname = $.trim(spl[0]);
                if (fname === fieldName) {
                    return (spl[index] && spl[index] === typeName);
                }
            }

            return false;
        };

        var convertTypes = function (row) {
            var obj = {};

            for (var prop in row) {

                var fieldVal = row[prop];
                
                if (isFieldOfType(meta, 'JSON', prop, 2))
                    obj[prop] = JSON.parse(fieldVal);

                else if (isFieldOfType(meta, 'BOOL', prop, 2))
                    obj[prop] = fieldVal == 'true';

                else if (isFieldOfType(meta, 'DATETIME', prop, 1))
                    obj[prop] = Date.fromYYYYString(fieldVal);

                else
                    obj[prop] = fieldVal;

            }

            return obj;
        };


        triggerCommChannel('start');

        switch (method) {
            case "read": ((model.attributes && model.attributes[model.idAttribute]) ?
                            store.find(model, successSingle, error) :
                            store.findAll(model, success, error, options.data));
                break;
            case "readExpr": store.findAllByExpr(options.expr, options.vals, success, error);
                break;
            case "create": store.create(model, successSingle, error, options.tx);
                break;
            case "createTable": store.createTable(model, options.success, error);
                break;
            case "delete": store.destroy(model, success, error, options.tx);
                break;
            case "trans":
                WebSQLStore.db.transaction(function (tx) {
                    options.process(tx);
                }, options.error, options.success);

            case "deleteExpr":

                if (!meta.archiveFilter) {
                    options.success();
                    return;
                }


                store.deleteExpr(meta, [], options.success, error);
                break;

            default:
                window.console.error(method + ' does not exist');
        }
    };

    Backbone.WebSQLStore = WebSQLStore;

    Backbone.Collection.prototype.fetchAllExpr = function (options) {
        var self = this;
        var optSuccess = options.success;
        options.success = function (res) {
            if (!options.preventModelBind)
                self.reset(res);
            optSuccess.call(options, res);
        };
        Backbone.sync('readExpr', this, options);
    };

    return (WebSQLStore); // Support backward compatibility.
})(window, Backbone);

    return WebSQLStore;
});