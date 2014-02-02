CosinnusApp.module("Entities", function (Entities, CosinnusApp, Backbone, Marionette, $, _) {

    /**
     * Backbone Todo Model
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todo = Backbone.Model.extend({
        urlRoot: "todos",

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
            priority: 'middle'
        },

        validate: function (attrs, options) {
            var errors = {};
            if (!attrs.title) {
                errors.title = "can't be blank";
            }
            else {
                if (attrs.title.length < 2) {
                    errors.title = "is too short";
                }
            }
            if (!_.isEmpty(errors)) {
                return errors;
            }
        }
    });

    /**
     * Backbone Todo Collection
     *
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todos = Backbone.Collection.extend({
        url: "todos",
        model: Entities.Todo,
        comparator: "title"
    });

    var initializeTodos = function () {
        console.log('initializeTodos()');
        todos = new Entities.Todos([
            { id: 1, title: 'Create the Backbone models', assigned_to: 'admin'},
            { id: 2, title: 'Create the Marionette views and controller', assigned_to: ''},
            { id: 3, title: 'Optimize the Javascript build', assigned_to: 'admin'},
        ]);
        todos.forEach(function (todo) {
            // TODO: enable save when there is an API
            // todo.save();
        });
        return todos.models;
    };

    var API = {
        getTodosEntities: function () {
            var todos = new Entities.Todos();
            var defer = $.Deferred();
            todos.fetch({
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (data) {
                    console.log('error fetching the Todos, creating others');
                    var models = initializeTodos();
                    todos = new Entities.Todos();
                    todos.reset(models);
                    data = todos;
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
                        defer.resolve(data);
                    },
                    error: function (data) {
                        defer.resolve(undefined);
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
