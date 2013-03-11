/**
 * @name PaletteView
 *
 */
var PaletteView = NavBox.extend({
    title: 'Palette',

    shapes: {
        'EPackage': EPackageShape,
        'EClass': EClassShape,
        'EEnum': EEnumShape,
        'EEnumLiteral': EEnumLiteralShape,
        'EDataType': EDataTypeShape,
        'EAttribute': EAttributeShape,
        'EOperation': EOperationShape
    },

    connections: {
        'EReference': EReferenceConnection,
        'ESuperTypes': ESuperTypesConnection
    },

    initialize: function(attributes) {
        _.bindAll(this);
        NavBox.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        NavBox.prototype.render.apply(this);

        _.each(this.shapes, function(shape, title) {
            var view = new PaletteItemView({ palette: this, shape: shape, title: title });
            this.views.push(view);
            this.$el.append(view.render().$el);
        }, this);

        _.each(this.connections, function(connection, title) {
            var view = new PaletteItemView({ palette: this, connection: connection, title: title });
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
    template: _.template('<div class="nav-row"><i class="icon-edit-<%= title %>"></i><span><%= title %></span></div>'),
    events: {
        'click': 'select'
    },
    initialize: function(attributes) {
        _.bindAll(this);
        this.palette = attributes.palette;
        this.shape = attributes.shape;
        this.connection = attributes.connection;
        this.title = attributes.title;
    },
    render: function() {
        var html = this.template({ title: this.title });
        this.setElement(html);
        return this;
    },
    select: function() {
        this.palette.selected = this;
    }
});

