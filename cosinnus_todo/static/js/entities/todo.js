TodoApp.module("Entities", function (Entities, TodoApp, Backbone, Marionette, $, _) {

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
    Entities.TodoCollection = Backbone.Collection.extend({
        url: "todos",
        model: Entities.Todo,
        comparator: "title"
    });

    var initializeTodos = function () {
        console.log('initializeTodos()');
        todos = new Entities.TodoCollection([
            { id: 1, title: 'Create the Backbone models', assigned_to: 'admin'},
            { id: 2, title: 'Create the Marionette views and controller', assigned_to: ''},
            { id: 3, title: 'Optimize the Javascript build', assigned_to: 'admin'},
        ]);
        todos.forEach(function (todo) {
            todo.save();
        });
        return todos.models;
    };

    var API = {
        getTodoEntities: function () {
            var todos = new Entities.TodoCollection();
            var defer = $.Deferred();
            todos.fetch({
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (data) {
                    console.log('error fetching the Todos');
                    defer.resolve(undefined);
                }
            });
            var promise = defer.promise();
            $.when(promise).done(function (todos) {
                if (todos === undefined || todos.length === 0) {
                    // if we don't have any todos yet, create some for convenience
                    var models = initializeTodos();
                    todos = new Entities.TodoCollection();
                    todos.reset(models);
                }
            });
            return promise;
        },

        getTodoEntity: function (todoId) {
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

    TodoApp.reqres.setHandler("todo:entities", function () {
        return API.getTodoEntities();
    });

    TodoApp.reqres.setHandler("todo:entity", function (id) {
        return API.getTodoEntity(id);
    });

});
