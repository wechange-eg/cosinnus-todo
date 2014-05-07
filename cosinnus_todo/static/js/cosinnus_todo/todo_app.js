CosinnusApp.module('TodosApp', function(TodosApp, CosinnusApp, Backbone, Marionette, $, _) {

    TodosApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'todo/list/': 'listTodos',
            'todo/:id': 'detailTodo',
            'todo/:id/edit': 'editTodo',
            'todolist/:id/edit': 'editTodo'
        }
    });
    

    TodosApp.LeftnavLayout = Marionette.Layout.extend({
        template: '#todo-leftnav-layout',
        //className: 'row',

        regions: {
            listsAllRegion: '.lists-all-container',
            listsNewRegion: '.lists-new-container'
        }
    });
    TodosApp.MainPageLayout = Marionette.Layout.extend({
        template: '#todo-main-layout',
        //className: 'row',

        regions: {
            itemsAllRegion: '.items-all-container',
            itemsNewRegion: '.items-new-container'
        }
    });
    

    TodosApp.keyScopes = {
        newList: 'new-list'
    };

    var API = {
        listTodos: function(todolist){
            TodosApp.List.Controller.listTodos(todolist);
        },
        detailTodo: function(id) {
            TodosApp.Detail.Controller.detailTodo(id);
        },
        editTodo: function(id) {
            console.log('edit from routing ...');
            TodosApp.Edit.Controller.editTodo(id);
        },
        editTodolist: function(id) {
            // TODO here
            console.log('edit from routing ...');
            TodosApp.Edit.TodolistController.editTodolist(id);
        }
    };

    CosinnusApp.on('todos:list', function (todolist) {
        CosinnusApp.navigate('todo/list/');
        API.listTodos(todolist);
    });

    CosinnusApp.on('todos:detail', function (id) {
        CosinnusApp.navigate('todo/' + id);
        API.detailTodo(id);
    });

    CosinnusApp.on('todos:edit', function (id) {
        CosinnusApp.navigate('todo/' + id + '/edit');
        API.editTodo(id);
    });

    CosinnusApp.addInitializer(function () {
        new TodosApp.Router({
            controller: API
        });
    });
    
    var currentTodolistId = null;
    
});

