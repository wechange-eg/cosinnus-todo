CosinnusApp.module('TodosApp', function(TodosApp, CosinnusApp, Backbone, Marionette, $, _) {

    TodosApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'todos': 'listTodos',
            'todos/:id': 'detailTodo',
            'todos/:id/edit': 'editTodo'
        }
    });

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
        }
    };

    CosinnusApp.on('todos:list', function (todolist) {
        CosinnusApp.navigate('todos');
        API.listTodos(todolist);
    });

    CosinnusApp.on('todos:detail', function (id) {
        CosinnusApp.navigate('todos/' + id);
        API.detailTodo(id);
    });

    CosinnusApp.on('todos:edit', function (id) {
        CosinnusApp.navigate('todos/' + id + '/edit');
        API.editTodo(id);
    });

    CosinnusApp.addInitializer(function () {
        new TodosApp.Router({
            controller: API
        });
    });

});

