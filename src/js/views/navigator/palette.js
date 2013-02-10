/**
 * @name PaletteView
 *
 */
var PaletteView = NavBox.extend({
    title: 'Palette',

    items: [
        'EPackage', 'EClass', 'EEnum', 'EEnumLiteral', 'EDataType',
        'EAttribute', 'EReference', 'EOperation'
    ],

    initialize: function(attributes) {
        _.bindAll(this);
        NavBox.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        NavBox.prototype.render.apply(this);

        _.each(this.items, function(item) {
            var view = new PaletteItemView({ shape: item });
            this.views.push(view);
            this.$el.append(view.render().$el);
        }, this);

        return this;
    }

});

/**
 * @name PaletteItemView
 *
 */
var PaletteItemView = Backbone.View.extend({
    template: _.template('<div class="nav-row"><i class="icon-edit-<%= shape %>"></i><span><%= shape %></span></div>'),
    initialize: function(attributes) {
        this.shape = attributes.shape;
    },
    render: function() {
        var html = this.template({ shape: this.shape });
        this.setElement(html);
        return this;
    }
});

