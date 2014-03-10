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
        Backbone.history.start({pushState: true, root: "/group/newgroup/"});  // use .start({silent: true}) to not navigate to first url

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
}


function initializeTodos() {
    $('.todos-container .item-title').on('click', function(e) {
        if (getSelectionText().length === 0) {
            var target = $(e.target);
            var inputEl = target.next();

            inputEl.val(target.html());
            inputEl.width(target.width());

            target.hide();
            inputEl.show().focus();
            console.log('click');
        }
    });

    $('.todos-container .item-title-input').on('blur', function(e) {
        var target = $(e.target);
        var titleEl = target.prev();
        var inputVal = target.val();
        if (inputVal.length > 0) {
            titleEl.html(inputVal);
        }

        target.hide();
        titleEl.show();
        console.log('blur');
    });
}

initializeTodos();
