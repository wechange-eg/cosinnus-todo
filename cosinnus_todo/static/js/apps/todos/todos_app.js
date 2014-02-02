CosinnusApp.module('TodosApp', function(TodosApp, CosinnusApp, Backbone, Marionette, $, _) {

    TodosApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'todos': 'listTodos',
            'todos/:id': 'detailTodo'
        }
    });

    var API = {
        listTodos: function(){
            TodosApp.List.Controller.listTodos();
        },
        detailTodo: function(id) {
            TodosApp.Detail.Controller.detailTodo(id);
        }
    };

    CosinnusApp.on("todos:list", function () {
        CosinnusApp.navigate("todos");
        API.listTodos();
    });

    CosinnusApp.on("todos:detail", function (id) {
        CosinnusApp.navigate("todos/" + id);
        API.detailTodo(id);
    });

    CosinnusApp.addInitializer(function () {
        new TodosApp.Router({
            controller: API
        });
    });

});
