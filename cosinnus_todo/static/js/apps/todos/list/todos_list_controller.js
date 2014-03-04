CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {

    List.Controller = {
        listTodos: function() {

            var fetchingTodos = CosinnusApp.request('todos:entities');

            var layout = new List.Layout();
            var topView = new List.TopView();

            $.when(fetchingTodos).done(function(todos){

                console.log('done fetching todos: ' + JSON.stringify(todos));

                var todosListView = new List.TodosView({
                    collection: todos
                });

                layout.on('show', function() {
                    layout.topRegion.show(topView);
                    layout.listRegion.show(todosListView);
                });

                topView.on('todos:new', function() {
                    console.log('todos:new start ...');
                    var newTodo = new CosinnusApp.Entities.Todo();

                    var view = new CosinnusApp.TodosApp.New.TodoView({
                        model: newTodo
                    });

                    view.on('form:submit', function (data) {
                        /*
                        if (todos.length > 0) {
                            var highestId = todos.max(function(c){return c.id;}).get('id');
                            data.id = highestId + 1;
                        } else {
                            data.id = 1;
                        }
                        */

                        // data.created_date = Date.now();

                        console.log('  create: ' + JSON.stringify(data));
                        var createdTodo = todos.create(data, {
                            wait: true,
                            error: function(obj, response) {
                                console.log('error: '+ JSON.parse(response.responseText));
                                view.triggerMethod("form:data:invalid", JSON.parse(response.responseText));
                            },
                            success: function(obj, response) {
                                console.log('successData = ' + response);
                                view.trigger("dialog:close");
                            }
                        });
                        if (createdTodo) {
                            console.log('  created:' + createdTodo);
                            // newTodo.set(data);
                            // todos.add(createdTodo);
                            // todosListView.children.findByModel(newTodo).flash("success");
                        } 
                    });

                    CosinnusApp.dialogRegion.show(view);
                });
                
                // superfluous
//                todosListView.on('itemview:todos:detail', function(childView, model) {
//                    CosinnusApp.trigger('todos:detail', model.get('id'));
//                });

                todosListView.on('itemview:todos:edit', function(childView, model) {
                    var view = new CosinnusApp.TodosApp.Edit.TodoView({
                        model: model
                    });

                    view.on('form:submit', function(data) {
                        if (model.save(data)) {
                            childView.render();
                            view.trigger("dialog:close");
                            childView.flash("success");
                        }
                        else {
                            view.triggerMethod("form:data:invalid", model.validationError);
                        }
                    });

                    CosinnusApp.dialogRegion.show(view);
                });

                CosinnusApp.mainRegion.show(layout);
            });
        }
    }

});