
CosinnusApp.module("Entities", function (Entities, CosinnusApp, Backbone, Marionette, $, _) {

    /**
     * Backbone Todo Model
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todo = Backbone.Model.extend({
        sync: setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '../api_json/todos/list',
        createUrl: '../api_json/todos/add/', // ??
        updateUrl: '../api_json/todos/update/',
        deleteUrl: '../api_json/todos/delete/',
        beforeSend: CosinnusApp.setCookieHeader,

        defaults: {
            title: '',
            note: '',
            created_by: '',
            assigned_to: '',
            due_date: '',
            tags: '',
            completed_date: '',
            completed_by: '',
            is_completed: false,
            priority: '1',
            created_date: ''
        }
    });


    // see http://stackoverflow.com/a/21466799/2510374
    function setDefaultUrlOptionByMethod(syncFunc) {
        return function sync(method, model, options) {
            options = options || {};
            options.beforeSend = CosinnusApp.setCookieHeader;
            if (!options.url)
                options.url = _.result(model, method + 'Url'); // Let Backbone.sync handle model.url fallback value
            return syncFunc.call(this, method, model, options);
        }
    }

    /**
     * Backbone Todo Collection
     *
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todos = Backbone.Collection.extend({
        sync: setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '../api_json/todos/list',
        createUrl: '/user/create',// ??
        updateUrl: '/user/update',// ??
        deleteUrl: '/user/delete',// ??
        model: Entities.Todo,
        comparator: 'id'
    });

    var initializeTodos = function () {
        console.log('initializeTodos()');
        todos = new Entities.Todos([
            { id: 1, title: 'Create the Backbone models', note: 'This a longer description', due_date: '07.02.2014', assigned_to: 'admin', created_date: '01.02.2014', created_by: 'admin'},
            { id: 2, title: 'Create the Marionette views and controller', assigned_to: '', created_date: '19.01.2014', created_by: 'admin'},
            { id: 3, title: 'Optimize the Javascript build', assigned_to: 'admin', created_date: '26.01.2014', created_by: 'admin'},
        ]);
        todos.forEach(function (todo) {
            // TODO: uncomment when there is an API
            // todo.save();
        });
        return todos.models;
    };

    var API = {

        // TODO: remove when Django API available
        // todos: null,

        getTodosEntities: function () {
            var todos = new Entities.Todos();
            var defer = $.Deferred();
            console.log('fetching todos ...');
            todos.fetch({
                success: function (data) {
                    // assumes the data is not paginated! (no PAGINATE_BY in settings.py)
                    console.log('fetched data from the API = ' + data);
                    defer.resolve(data);
                },
                error: function (data, response) {
                    console.log('error fetching the Todos. response: ' + response.responseText);
                    var models = initializeTodos();
                    todos = new Entities.Todos();
                    todos.reset(models);

                    data = todos;
                    API.todos = data;
                    defer.resolve(data);
                }
            });
            var promise = defer.promise();
            $.when(promise).done(function (todos) {
                if (typeof todos == 'undefined' || todos.length === 0) {

                    // currently initialized in the error method.

                    /*
                    // if we don't have any todos yet, create some for convenience
                    var models = initializeTodos();
                    todos = new Entities.Todos();
                    todos.reset(models);
                    */
                }
            });
            return promise;
        },

        getTodosEntity: function (todoId) {
            var todo = new Entities.Todo({id: todoId});
            var defer = $.Deferred();
            setTimeout(function () {
                todo.fetch({
                    success: function (data) {
                        console.log('fetched TODO = ' + JSON.stringify(data));
                        defer.resolve(data);
                    },
                    error: function (data) {
                        console.log('error fetching TODO');
                        // TODO: uncomment when there is a Django API
                        // defer.resolve(undefined);

                        // TODO: delete when there is a Django API
                        if (API.todos === null) {
                            var models = new Entities.Todos();
                            models.reset(initializeTodos());
                            API.todos = models;

                            console.log('API.todos = ' + JSON.stringify(API.todos));
                        }

                        defer.resolve(API.todos.get(todoId));
                    }
                });
            }, 500);
            return defer.promise();
        }
    };

    CosinnusApp.reqres.setHandler("todos:entities", function () {
        return API.getTodosEntities();
    });

    CosinnusApp.reqres.setHandler("todos:entity", function (id) {
        return API.getTodosEntity(id);
    });

});
