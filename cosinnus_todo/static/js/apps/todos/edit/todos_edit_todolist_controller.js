CosinnusApp.module('TodosApp.Edit', function(Edit, CosinnusApp, Backbone, Marionette, $, _) {

    Edit.TodolistController = {
            // TODO here
        editTodolist: function(slug) {
            var fetchingTodolist = CosinnusApp.request('todos:todolist', slug);
            console.log('fetchingTodo ...');
            $.when(fetchingTodolist).done(function(todolist){
                console.log('fetchingTodo DONE.');
                var view;
                if (todolist !== undefined) {
                    view = new Edit.TodolistView({
                        model: todolist,
                        generateTitle: true
                    });

                    view.on('form:submit', function(data) {
                        if (todolist.save(data)) {
                            CosinnusApp.trigger('todos:list', todolist.get('slug'));
                        } else {
                            view.triggerMethod('form:data:invalid', todolist.validationError);
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
