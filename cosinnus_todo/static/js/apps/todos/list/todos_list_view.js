CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {
    
    List.Layout = Marionette.Layout.extend({
        template: '#todos-list-layout',
     
        regions: {
            topRegion: '#todos-top-region',
            listRegion: '#todos-list-region'
        }
    });
    
    List.TopView = Marionette.ItemView.extend({
        template: '#todos-top',
        className: 'clearfix',

        triggers: {
            'click a.js-new': 'todos:new'
        }
    });

    List.TodoView = Marionette.ItemView.extend({
        template: '#todos-list-item',
        tagName: 'tr',

        events: {
            'click .js-detail': 'detailClicked',
            'click .js-edit': 'editClicked',
            'click .js-delete': 'deleteClicked'
        },

        flash: function (cssClass) {
            var $view = this.$el;
            $view.hide().toggleClass(cssClass).fadeIn(800, function () {
                setTimeout(function () {
                    $view.toggleClass(cssClass)
                }, 500);
            });
        },

        detailClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            //this.trigger('todos:detail', this.model);
            // more direct way to do this:
            CosinnusApp.trigger('todos:detail', this.model.get('id'));
        },

        editClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todos:edit', this.model);
        },
        
        deleteClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todos:delete', this.model);
        },

        remove: function () {
            // fade out the element before removing it
            var self = this;
            this.$el.fadeOut(function () {
                Marionette.ItemView.prototype.remove.call(self);
            });
        }
    });
    
    List.TodosView = Marionette.CompositeView.extend({
        template: '#todos-list',
        itemView: List.TodoView,
        itemViewContainer: 'tbody',
        className: 'table table-striped',
        tagName: 'table',
        collection: null, // supplied at instantiation time

        initialize: function () {
            // on reset add the element
            this.listenTo(this.collection, "reset", function () {
                this.appendHtml = function (collectionView, itemView, index) {
                    collectionView.$el.append(itemView.el);
                }
            });
            this.collection.bind("sync", function(){console.log("debug:: TodoList-Collection synced!")})
        },

        onCompositeCollectionRendered: function () {
            // prepend the element to the top instead of appending to the bottom
            this.appendHtml = function (collectionView, itemView, index) {
                collectionView.$el.prepend(itemView.el);
            }
        }
    });

});
