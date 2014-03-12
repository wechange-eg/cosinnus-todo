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
            console.log('fetched entity = ' + JSON.stringify(data));
            defer.resolve(data);
        },
        error: function (data) {
            console.log('error fetching TODO');
            defer.reject(data);
        }
    });
    var promise = defer.promise();
    $.when(promise).fail(function (entity) {
        console.log(":: some error occured.")
    });
    return promise;
};


CosinnusApp.initializeTodos = function() {

    $('.lists-container .list-group-item').on('click', function() {
        console.log('List click');
    });

    // LISTS

    $('.js-new-list-title').on('focus', function(e) {
        console.log('new list click');
        if (!CosinnusApp.creatingNewList) {
            CosinnusApp.creatingNewList = true;
            var target = $(e.target);
            CosinnusApp.activateNewListTitleEditing(target);
        }
    });

//    $('.js-new-list-title').on('click', function(e) {
//        console.log('new list click');
//        var target = $(e.currentTarget);
//        target.html('');
//    });

    // TODOS

    var itemTitlesEls = $('.todos-all-container .item-title');

    itemTitlesEls.on('click', function(e) {
        console.log('click');
        var target = $(e.target);
        CosinnusApp.activateItemTitleEditing(target);
    });

    itemTitlesEls.on('input', function(e) {
        console.log('change');
    });

    $('.js-item-title-save').on('click', function(e) {
        console.log('save.js clicked');
        var target = $(e.currentTarget).parent().prev();
        CosinnusApp.saveClicked(target);
    });

    $('.js-item-title-cancel').on('click', function(e) {
        console.log('cancel.js clicked');
        var target = $(e.currentTarget);
        var el = target.parent().prev();
        CosinnusApp.cancelClicked(el);
    });
};
CosinnusApp.initializeTodos();


CosinnusApp.definedShortcuts = function() {

    // LISTS

    // create new list
    key('enter, ctrl+enter, ⌘+enter', 'new-list', function(e, handler){
        console.log('Enter pressed (new list)');
        var target = $(e.target);
        CosinnusApp.createNewList(target);
        target.blur();
        target.html(CosinnusApp.newListText);
        return false;
    });

    // cancel creation of a new list
    key('escape', 'new-list', function(e, handler){
        console.log('Escape pressed (new list)');
        var target = $(e.target);
        CosinnusApp.cancelCreatingNewList(target);
        target.blur();
        return false;
    });

    // TODOS

    key('enter, ctrl+enter, ⌘+enter', 'item-title', function(e, handler){
        console.log('Enter pressed');
        var target = $(e.target);
        CosinnusApp.saveClicked(target);
        target.blur();
        return false;
    });
    key('escape', 'item-title', function(e, handler){
        console.log('Escape pressed');
        var target = $(e.target);
        CosinnusApp.cancelClicked(target);
        target.blur();
        return false;
    });
    key('f2', function(e, handler){
        console.log('F2 pressed');
        if (CosinnusApp.editedItem !== undefined) {
            console.log('F2 pressed inside ...');
            CosinnusApp.editedItem.trigger('click');
            CosinnusApp.editedItem.focus();
        }
        return false;
    });
};

/**
 * Item title click handler.
 *
 * @param target - jQuery element
 */
CosinnusApp.activateNewListTitleEditing = function(target) {
    key.setScope('new-list');
    CosinnusApp.editedItem = target;
    target.html('');
};


/**
 * Variable for the current state of new list creation.
 * True means the user started to create a list.
 * False means the user hasn't yet started to create a list.
 * @type {boolean}
 */
CosinnusApp.creatingNewList = false;
CosinnusApp.newListText = 'Lege eine neue Liste an';

CosinnusApp.createNewList = function(target) {
    var listTitle = target.html();
    console.log('Creating new List: ' + listTitle);
    CosinnusApp.creatingNewList = false;
};

CosinnusApp.cancelCreatingNewList = function(target) {
    console.log('Canceled creating new');
    target.html(CosinnusApp.newListText);
    CosinnusApp.creatingNewList = false;
};

/**
 * Item title click handler.
 *
 * @param target - jQuery element
 */
CosinnusApp.activateItemTitleEditing = function(target) {
    console.log('activateItemTitleEditing()');
    key.setScope('item-title');
    CosinnusApp.editedItem = target;
    CosinnusApp.editedItemLastValue = target.html();
    var titleButtonsEl = CosinnusApp.getTitleButtonsElement(target);
    titleButtonsEl.show();
};

/**
 * Saves an item
 * @param target - jQuery input element
 */
CosinnusApp.saveClicked = function(target) {
    console.log('saveClicked()');
    key.setScope('all');
    CosinnusApp.getTitleButtonsElement(target).hide();
};

/**
 * Saves an item
 * @param target - jQuery input element
 */
CosinnusApp.cancelClicked = function(target) {
    console.log('cancelClicked()');
    target.html(CosinnusApp.editedItemLastValue);
    CosinnusApp.getTitleButtonsElement(target).hide();
};

CosinnusApp.getTitleButtonsElement = function(target) {
    return target.next();
};


CosinnusApp.definedShortcuts();
