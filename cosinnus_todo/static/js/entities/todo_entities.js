
CosinnusApp.module("Entities", function (Entities, CosinnusApp, Backbone, Marionette, $, _) {

    /**
     * Backbone Todo Model
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todo = Backbone.Model.extend({
        sync: CosinnusApp.setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '../api/todos/list/',
        createUrl: '../api/todos/add/', // ??
        updateUrl: '../api/todos/update/',
        deleteUrl: '../api/todos/delete/',
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

    /**
     * Backbone Todo Collection
     *
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todos = Backbone.Collection.extend({
        sync: CosinnusApp.setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '../api/todos/list/',
        createUrl: '/user/create',// ??
        updateUrl: '/user/update',// ??
        deleteUrl: '/user/delete',// ??
        model: Entities.Todo,
        comparator: 'id'
    });

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
                }
            });
            var promise = defer.promise();
            $.when(promise).done(function (todos) {
                if (typeof todos == 'undefined' || todos.length === 0) {
                    // nothing
                    console.log(":: some error occured.")
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
