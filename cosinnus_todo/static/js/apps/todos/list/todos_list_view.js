CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {
    
    List.Layout = Marionette.Layout.extend({
        template: '#todos-list-layout',
     
        regions: {
            topRegion: '#todos-top-region',
            listRegion: '#todos-list-region'
        }
    });
    
    List.TopView = Marionette.ItemView.extend({
        template: '#todos-top'
    });

    List.TodoView = Marionette.ItemView.extend({
        template: '#todos-list-item',
        tagName: 'tr',

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

        initialize: function () {
            // on reset add the element
            this.listenTo(this.collection, "reset", function () {
                this.appendHtml = function (collectionView, itemView, index) {
                    collectionView.$el.append(itemView.el);
                }
            });
        },

        onCompositeCollectionRendered: function () {
            // prepend the element to the top instead of appending to the bottom
            this.appendHtml = function (collectionView, itemView, index) {
                collectionView.$el.prepend(itemView.el);
            }
        }
    });

});
