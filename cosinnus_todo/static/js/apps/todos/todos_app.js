CosinnusApp.module('TodosApp', function(TodosApp, CosinnusApp, Backbone, Marionette, $, _) {

    TodosApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'todos': 'listTodos'
        }
    });

    var API = {
        listTodos: function(){
            TodosApp.List.Controller.listTodos();
        }
    };

    CosinnusApp.on("todos:list", function () {
        CosinnusApp.navigate("todos");
        API.listTodos();
    });

    CosinnusApp.addInitializer(function () {
        new TodosApp.Router({
            controller: API
        });
    });

});
