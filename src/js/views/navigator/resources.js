/**
 * @name ResourceSetView
 * @class
 *
 */
var ResourceSetView = NavBox.extend({
    title: 'Resources',

    initialize: function(attributes) {
        _.bindAll(this, 'show', 'hide');
        NavBox.prototype.initialize.apply(this, [attributes]);
        this.modal = new CreateResourceModal({ model: this.model });
        this.model.on('change add remove', this.render);
    },

    render: function() {
        NavBox.prototype.render.apply(this);

        this.model.get('resources').each(this.addResource, this);
        var emptyView = new ResourceView().render();
        this.views.push(emptyView);
        this.$el.append(emptyView.$el);

        _.each(this.views, function(view) {
            view.on('create', this.createResource, this);
            view.on('open:editor', function() { this.navigator.trigger('open:editor', view.model); }, this);
            view.on('open:diagram', function() { this.navigator.trigger('open:diagram', view.model); }, this);
            view.on('remove', this.deleteResource, this);
        }, this);

        return this;
    },

    addResource: function(res) {
        var view = new ResourceView({ model: res });
        view.render();
        this.views.push(view);
        this.$el.append(view.$el);
        return this;
    },

    deleteResource: function(resource) {
    // TODO
    // this.model.remove(resource);
    },

    createResource: function(e) {
        this.modal.render().show();
    }

});

/**
 * @name ResourceView
 * @class
 */
var ResourceView = Backbone.View.extend({
    template:
        '<div class="nav-row">' +
        '</div>',
    templateResource: _.template(
            '<i class="<%= icon1 %>"></i>' +
            '<span> <%= uri %></span>' +
            '<i class="<%= icon2 %>""></i>' +
            '<i class="<%= icon3 %>""</i>'),
    templateAdd: _.template(
        '<i class="<%= icon4 %>"></i>'),

    events: {
        'click': 'openEditor',
        'click .icon-remove': 'remove',
        'click .icon-plus': 'createResource',
        'click .icon-sitemap': 'openDiagram'
    },

    icons: [
        { klass: 'icon-folder-close icon-large' },
        { klass: 'icon-remove icon-large', tooltip: 'Delete this resource' },
        { klass: 'icon-sitemap icon-large', tooltip: 'Open this resoure in a diagram' },
        { klass: 'icon-plus icon-large', tooltip: 'Create a new resource' }
    ],

    initialize: function(attributes) {
        _.bindAll(this);
    },
    render: function() {
        this.setElement(this.template);

        if (this.model) {
            this.$el.children().remove();
            this.$el.append(this.templateResource({
                icon1: this.icons[0].klass,
                icon2: this.icons[1].klass,
                icon3: this.icons[2].klass,
                uri: this.model.get('uri')
            }));
        } else {
            this.$el.children().remove();
            this.$el.append(this.templateAdd({
                icon4: this.icons[3].klass
            }));
        }

        this.addTooltip();

        return this;
    },
    addTooltip: function() {
        _.each(this.icons, function(icon) {
            var el = $('i[class="'+icon.klass+'"]', this.$el);
            if (el.length && icon.tooltip)
                el.tooltip({
                    placement: 'right',
                    title: icon.tooltip,
                    trigger: 'hover'
                });
        }, this);
    },
    openEditor: function(e) {
        if (e) e.stopPropagation();
        if (this.model) {
            this.trigger('open:editor', this.model);
        }
    },
    createResource: function() {
        this.trigger('create', this);
    },
    openDiagram: function(e) {
        if (e) e.stopPropagation();
        if (this.model) {
            this.trigger('open:diagram', this.model);
        }
    },
    remove: function() {
        this.trigger('remove', this.model);
        return Backbone.View.prototype.remove.apply(this);
    }
});

