(function ($, window, document) {
    window.Cosinnus = {
        init: function(base_url) {
            this.base_url = cosinnus_base_url;
            $.ajaxSetup({
                // From the Django documentation:
                // https://docs.djangoproject.com/en/1.6/ref/contrib/csrf/
                crossDomain: false,
                beforeSend: function(xhr, settings) {
                    if (!Cosinnus.csrfSafeMethod(settings.type)) {
                        xhr.setRequestHeader("X-CSRFToken", Cosinnus.getCookie('csrftoken'));
                    }
                }
            });
            return this;
        },
        getCookie: function(name) {
            // From the Django documentation:
            // https://docs.djangoproject.com/en/1.6/ref/contrib/csrf/
            var cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        },
        csrfSafeMethod: function(method) {
            // From the Django documentation:
            // https://docs.djangoproject.com/en/1.6/ref/contrib/csrf/
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
    };
    $.fn.cosinnus = Cosinnus.init(cosinnus_base_url);
}(jQuery, this, this.document));



var CosinnusApp = new Marionette.Application();

Marionette.Region.Dialog = Marionette.Region.extend({
    onShow: function (view) {
        this.listenTo(view, "dialog:close", this.closeDialog);
        var self = this;
        this.$el.dialog({
            modal: true,
            title: view.title,
            width: "auto",
            close: function (e, ui) {
                self.closeDialog();
            }
        });
    },
    closeDialog: function () {
        this.stopListening();
        this.close();
        this.$el.dialog("destroy");
    }
});


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
        Backbone.history.start({pushState: true, root: "/group/" + cosinnus_active_group + "/"});  // use .start({silent: true}) to not navigate to first url
    }
});

CosinnusApp.host = window.location.origin;

CosinnusApp.select2Format = function(state) {
    var $originalOption = $(state.element);

    if (!state.id) {
        return state.text;
    } else {
        var avatarUrl = $originalOption.data('avatar-url');
        return "<img class='flag avatar-img' src='"+CosinnusApp.host+avatarUrl+"'/>" + state.text;
    }
};

CosinnusApp.select2Options = {
    formatResult: CosinnusApp.select2Format,
    formatSelection: CosinnusApp.select2Format,
    escapeMarkup: function(m) { return m; }
};

CosinnusApp.datePickerOptions = {
    autoclose: true,
    weekStart: 1,
    pickTime: false,
    language: 'de',
    format: cosinnus_date_format
};

CosinnusApp.isUserLoggedIn = function () {
    if (cosinnus_active_user) {
        return true;
    }
    return false;
}

CosinnusApp.setCookieHeader = function(xhr, settings) {
    if (!Cosinnus.csrfSafeMethod(settings.type)) {
        xhr.setRequestHeader("X-CSRFToken", Cosinnus.getCookie('csrftoken'));
    }
};

// see http://stackoverflow.com/a/21466799/2510374
CosinnusApp.setDefaultUrlOptionByMethod = function(syncFunc) {
    return function sync(method, model, options) {
        
        console.log('>> SYNC method options:' +  JSON.stringify(options));
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
};

// fetch an entity from the API backend. 
// if a single instance (with known pk or slug) is needed, 
//      use the @param constructor_kwargs to initialize it and fetch it from the API
//      ex: fetchEntityDeferred(CosinnusApp.TodosApp.Entities.Todo, {id:'todo1'})
//      note: you MUST supply the kwarg 'id' for Backend to append that value to the GET url,
//            even if it is really a slug! (the example call would call a GET to '/todo/list/todo1/'!)
// if the API request should contain any parameters, use the @param request_kwargs
// returns a promise object. get the data from it like this:
//      promise = fetchEntityDeferred(...)
//      $.when(promise).done(function(returned_data){ do_something; })
CosinnusApp.fetchEntityDeferred = function (klass, constructor_kwargs, request_kwargs) {
    var entity = new klass(constructor_kwargs);
    var defer = $.Deferred();
    console.log(">> Fetching with params: " + JSON.stringify(constructor_kwargs) + " ; "  + JSON.stringify(request_kwargs))
    entity.fetch({
        data: request_kwargs,
        success: function (data) {
            defer.resolve(data);
        },
        error: function (data, request) {
            console.log('error fetching TODO' + request.responseText);
            defer.reject(data);
        }
    });
    var promise = defer.promise();
    $.when(promise).fail(function (entity) {
        console.log(":: some error occured.")
    });
    return promise;
};
