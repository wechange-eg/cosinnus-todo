CosinnusApp.module("TodosApp.Entities", function (Entities, CosinnusApp, Backbone, Marionette, $, _) {

    /**
     * Backbone Todo Model
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    
    Entities.Todo = Backbone.Model.extend({
        sync: CosinnusApp.setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todos/list/',
        createUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todos/add/',
        updateUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todos/update/',
        deleteUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todos/delete/',
        beforeSend: CosinnusApp.setCookieHeader,
        
        defaults: {
            title: '',
            slug:'',
            note: '',
            todolist: '',
            creator: '',
            due_date: '',
            tags: '',
            is_completed: false,
            priority: '1',
            created: '',
            assigned_to: '',
            completed_by: ''
        }

    });

    /**
     * Backbone Todo Collection
     *
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todos = Backbone.Collection.extend({
        sync: CosinnusApp.setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todos/list/',
        createUrl: '/user/create',// ??
        updateUrl: '/user/update',// ??
        deleteUrl: '/user/delete',// ??
        model: Entities.Todo,
        comparator: 'id'
    });
    
    /**
     * Backbone Todo Model
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todolist = Backbone.Model.extend({
        sync: CosinnusApp.setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todolist/list/',
        createUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todolist/add/',
        updateUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todolist/update/',
        deleteUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todolist/delete/',
        beforeSend: CosinnusApp.setCookieHeader,
        
        defaults: {
            title: '',
            slug:'',
            item_count: 0
        }
    });
    
    /**
     * Backbone Todo Collection
     *
     * @type {*|void|Object|exports.extend|jQuery.autogrow.extend|a.extend}
     */
    Entities.Todolists = Backbone.Collection.extend({
        sync: CosinnusApp.setDefaultUrlOptionByMethod(Backbone.sync),
        readUrl: '/api/v1/group/' + cosinnus_active_group + '/todo/todolist/list/',
        createUrl: '/user/create',// ??
        updateUrl: '/user/update',// ??
        deleteUrl: '/user/delete',// ??
        model: Entities.Todolist,
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

        getTodos: function (todolist) {
            return CosinnusApp.fetchEntityDeferred(CosinnusApp.TodosApp.Entities.Todos, null, {list:todolist});
        },

        getTodo: function (slug) {
            return CosinnusApp.fetchEntityDeferred(CosinnusApp.TodosApp.Entities.Todo, {id:slug});
        },
        
        getTodolists: function () {
            return CosinnusApp.fetchEntityDeferred(CosinnusApp.TodosApp.Entities.Todolists);
        },

        getTodolist: function (slug) {
            return CosinnusApp.fetchEntityDeferred(CosinnusApp.TodosApp.Entities.Todolist, {id:slug});
        }
    };

    CosinnusApp.reqres.setHandler("todos:entities", function (todolist) {
        return API.getTodos(todolist);
    });

    CosinnusApp.reqres.setHandler("todos:entity", function (slug) {
        return API.getTodo(slug);
    });
    
    CosinnusApp.reqres.setHandler("todos:todolists", function () {
        return API.getTodolists();
    });

    CosinnusApp.reqres.setHandler("todos:todolist", function (slug) {
        return API.getTodolist(slug);
    });

});
