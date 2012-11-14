define(['underscore', 'backbone', 'collections/a_base/serverRefreshedCollectionBase'],
    function (_, Backbone, ServerRefreshedCollectionBase) {
        return ServerRefreshedCollectionBase.extend({
            _fetchDistinct: function (field, where) {
                var dfd = $.Deferred();

                var table = new this.model().localStoreMeta.store; //todo make this static off model
                var sqlWhere = where ? ' WHERE ' + where : '';
                var sql = "SELECT DISTINCT " + field + " from " + table + sqlWhere + " ORDER BY " + field + " ASC";

                this.fetchAllExpr({
                    expr: sql,
                    vals: [],
                    preventModelBind: true,
                    success: function (res) {
                        dfd.resolve(res);
                    },
                    error: function (tx, error) {
                        dfd.reject(error);
                    }
                });

                return dfd.promise();
            },
            _fetchPaged: function (options) {

                var table = new this.model().localStoreMeta.store;
                var sqlFromWhere = "FROM " + table + (options.where ? " WHERE " + options.where : '');
                var sqlOrderBy = options.orderBy;
                var vals = options.vals;


                var self = this;
                var sqlCount = "SELECT count(*) as cnt " + sqlFromWhere;

                this.fetchAllExpr({
                    expr: sqlCount,
                    vals: vals,
                    success: function (res) {

                        self.count = res[0].cnt;
                        var skip = (options.pageNo - 1) * options.pageSize;
                        self.hasMorePages = self.count > (skip + options.pageSize);

                        if (!self.count) {
                            self.reset([]);
                            options.success([]);
                            return;
                        }

                        //paging

                        vals.push(skip);
                        vals.push(options.pageSize);

                        //results
                        var sql = "SELECT * " + sqlFromWhere + " ORDER BY " + sqlOrderBy + " LIMIT ?, ?";
                        self.fetchAllExpr({
                            expr: sql,
                            vals: vals,
                            success: function (res1) {
                                options.success(res1);
                            },
                            error: function (tx, error) {
                                options.error(error);
                            }
                        });
                    },
                    error: function (tx, error) {
                        options.error(error);
                    }
                });
            }
        });
    });