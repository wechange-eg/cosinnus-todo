CosinnusApp.module('TodosApp', function(TodosApp, CosinnusApp, Backbone, Marionette, $, _) {

    TodosApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'todo/list/': 'listTodos',
            'todo/:slug': 'detailTodo',
            'todo/:slug/edit': 'editTodo',
            'todolist/:slug/edit': 'editTodo'
        }
    });

    var API = {
        listTodos: function(todolist){
            TodosApp.List.Controller.listTodos(todolist);
        },
        detailTodo: function(slug) {
            TodosApp.Detail.Controller.detailTodo(slug);
        },
        editTodo: function(slug) {
            console.log('edit from routing ...');
            TodosApp.Edit.Controller.editTodo(slug);
        },
        editTodolist: function(slug) {
            // TODO here
            console.log('edit from routing ...');
            TodosApp.Edit.TodolistController.editTodolist(slug);
        }
    };

    CosinnusApp.on('todos:list', function (todolist) {
        CosinnusApp.navigate('todo/list/');
        API.listTodos(todolist);
    });

    CosinnusApp.on('todos:detail', function (slug) {
        CosinnusApp.navigate('todo/' + slug);
        API.detailTodo(slug);
    });

    CosinnusApp.on('todos:edit', function (slug) {
        CosinnusApp.navigate('todo/' + slug + '/edit');
        API.editTodo(slug);
    });

    CosinnusApp.addInitializer(function () {
        new TodosApp.Router({
            controller: API
        });
    });

});

