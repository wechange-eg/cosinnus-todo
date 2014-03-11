CosinnusApp.module("TodosApp.Common.Views", function (Views, CosinnusApp, Backbone, Marionette, $, _) {

    Views.TodoEditForm = Marionette.ItemView.extend({
        template: "#todos-edit-form",

        events: {
            "click button.js-submit": "submitClicked"
        },

        submitClicked: function (e) {
            e.preventDefault();
            var data = Backbone.Syphon.serialize(this);
            console.log('submitClicked. data='+JSON.stringify(data));
            this.trigger('form:submit', data);
        },

        onFormDataInvalid: function (errors) {
            var $view = this.$el;

            var clearFormErrors = function () {
                var $form = $view.find("form");
                $form.find(".help-block.error").each(function () {
                    $(this).remove();
                });
                $form.find(".form-group.has-error").each(function () {
                    $(this).removeClass("has-error");
                });
            };

            var markErrors = function (value, key) {
                var $formGroup = $view.find("#todo-" + key).parent();
                var $errorEl = $("<span>", { class: "help-block error", text: value });
                $formGroup.append($errorEl).addClass("has-error");
            };

            clearFormErrors();
            _.each(errors, markErrors);
        }
    });
    
    
    Views.TodolistEditForm = Views.TodoEditForm.extend({
        template: "#todolist-edit-form"

//        events: {
//            "click button.js-submit": "submitClicked"
//        },
//
//        submitClicked: function (e) {
//            e.preventDefault();
//            var data = Backbone.Syphon.serialize(this);
//            console.log('submitClicked. data='+JSON.stringify(data));
//            this.trigger('form:submit', data);
//        },
//
//        onFormDataInvalid: function (errors) {
//            var $view = this.$el;
//
//            var clearFormErrors = function () {
//                var $form = $view.find("form");
//                $form.find(".help-block.error").each(function () {
//                    $(this).remove();
//                });
//                $form.find(".form-group.has-error").each(function () {
//                    $(this).removeClass("has-error");
//                });
//            };
//
//            var markErrors = function (value, key) {
//                var $formGroup = $view.find("#todo-" + key).parent();
//                var $errorEl = $("<span>", { class: "help-block error", text: value });
//                $formGroup.append($errorEl).addClass("has-error");
//            };
//
//            clearFormErrors();
//            _.each(errors, markErrors);
//        }
    });

});
