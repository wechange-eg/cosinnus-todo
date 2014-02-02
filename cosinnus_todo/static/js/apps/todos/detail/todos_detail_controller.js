CosinnusApp.module('TodosApp.Detail', function(Detail, CosinnusApp, Backbone, Marionette, $, _) {

    Detail.Controller = {
        detailTodo: function(id) {
            var fetchingTodo = CosinnusApp.request('todos:entity', id);
            $.when(fetchingTodo).done(function(todo){
                var todoView;

                if (todo !== undefined) {
                    todoView = new Detail.TodoView({
                        model: todo
                    });
                }
                else {
                    todoView = new Detail.MissingTodoView();
                }

                CosinnusApp.mainRegion.show(todoView);
            });
        }
    }

});
