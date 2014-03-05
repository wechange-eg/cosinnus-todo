var CosinnusApp = new Marionette.Application();

CosinnusApp.addRegions({
    mainRegion: "#main-region",
    dialogRegion: Marionette.Region.Dialog.extend({
        el: "#dialog-region"
    })
});

CosinnusApp.navigate = function (route, options) {
    options || (options = {});
    Backbone.history.navigate(route, options);
};

CosinnusApp.getCurrentRoute = function () {
    return Backbone.history.fragment
};

CosinnusApp.on('initialize:after', function () {
    if (Backbone.history) {
        Backbone.history.start();

        if (this.getCurrentRoute() === "") {
            CosinnusApp.trigger('todos:list');
        }
    }
});

CosinnusApp.setCookieHeader = function(xhr, settings) {
    if (!Cosinnus.csrfSafeMethod(settings.type)) {
        xhr.setRequestHeader("X-CSRFToken", Cosinnus.getCookie('csrftoken'));
    }
}

// see http://stackoverflow.com/a/21466799/2510374
CosinnusApp.setDefaultUrlOptionByMethod = function(syncFunc) {
    return function sync(method, model, options) {
        options = options || {};
        options.beforeSend = CosinnusApp.setCookieHeader;
        if (!options.url) {
            options.url = _.result(model, method + 'Url'); // Let Backbone.sync handle model.url fallback value
            if (model && model.id) {
                options.url += model.id + '/';
            }
        }
        return syncFunc.call(this, method, model, options);
    }
}

