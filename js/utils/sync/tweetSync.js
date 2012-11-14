define(['utils/sync/modelServerSync', 'collections/tweets', 'models/tweet'], function (SyncBase, Tweets, Tweet) {

    var TweetSync = function (firstTimeSuccess) {

        SyncBase.call(this, Tweets, Tweet, firstTimeSuccess);

       

        this.getChanges = function (lastUpdate, callback, errorCallback) {

            var tweets = new Tweets();
            tweets.fetchFromTwitter({
                error: errorCallback,
                success: function (data) {
                    callback(data);
                }
            });
        };
    };

    TweetSync.prototype = SyncBase.prototype;
    TweetSync.prototype.constructor = TweetSync;

    return TweetSync;
});
