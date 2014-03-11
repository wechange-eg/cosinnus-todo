CosinnusApp.module('TodosApp.New', function(New, CosinnusApp, Backbone, Marionette, $, _) {

    New.TodolistView = CosinnusApp.TodosApp.Common.Views.TodolistEditForm.extend({
        title: 'New Todolist',

        onRender: function() {
            this.$('.js-submit').text('Create Todolist');
        }
    });

});
