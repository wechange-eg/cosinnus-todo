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

                CosinnusApp.mainRegion.show(layout);
            });
        }
    }

});