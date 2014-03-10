CosinnusApp.module('TodosApp.Edit', function(Edit, CosinnusApp, Backbone, Marionette, $, _) {

    Edit.Controller = {
        editTodo: function(id) {
            var fetchingTodo = CosinnusApp.request('todos:entity', id);
            console.log('fetchingTodo ...');
            $.when(fetchingTodo).done(function(todo){
                console.log('fetchingTodo DONE.');
                var view;
                if (todo !== undefined) {
                    view = new Edit.TodoView({
                        model: todo,
                        generateTitle: true
                    });

                    view.on('form:submit', function(data) {
                        if (todo.save(data)) {
                            CosinnusApp.trigger('todos:detail', todo.get('slug'));
                        } else {
                            view.triggerMethod('form:data:invalid', todo.validationError);
                        }
                    });

                } else {
                    // if not to-do was found, show missing view
                    view = new CosinnusApp.TodosApp.Detail.MissingTodoView();
                }

                CosinnusApp.mainRegion.show(view);
            });
        }
    }

});
