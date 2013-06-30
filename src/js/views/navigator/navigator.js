/**
 * Navigator
 *
 */
var NavigatorView = Backbone.View.extend({
    el: '#navigator',

    initialize: function() {
        _.bindAll(this);
        this.resourceSetView = new ResourceSetView({ model: this.model, navigator: this });
        this.paletteView = new PaletteView({ navigator: this });
        this.propertyView = new PropertyView({ navigator: this });

        this.header = new NavigatorHeaderView();
        this.header.on('hide', this.hide);
        this.header.on('show', this.show);
    },

    render: function() {
        this.$header = this.header.render().$el;
        this.$el.append(this.$header);
        this.$el.append(this.resourceSetView.render().$el);
        this.$el.append(this.paletteView.render().$el);
        this.$el.append(this.propertyView.render().$el);

        return this;
    },

    hide: function() {
        this.trigger('hide');
        this.resourceSetView.remove();
        this.paletteView.remove();
        this.propertyView.remove();
        this.$header = this.header.render(true).$el;
        this.$el.append(this.$header);
        this.$el.animate({ width: '30px' }, 200);
    },

    show: function() {
        this.trigger('show');
        this.$el.animate({ width: '280px' }, 200);
        this.render();
    }

});

