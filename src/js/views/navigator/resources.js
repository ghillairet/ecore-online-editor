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
        this.model.on('change', this.render);
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
    template: _.template('<div class="nav-row"></div>'),
    templateIcon: _.template('<i class="icon-folder-close icon-large"></i>'),
    templateLabel: _.template('<span> <%= uri %></span>'),
    templateRemove: _.template('<i class="icon-remove icon-large"></i>'),
    templateDiagram: _.template('<i class="icon-sitemap icon-large"</i>'),
    templateAdd: _.template('<i class="icon-plus icon-large"></i>'),

    events: {
        'click': 'openEditor',
        'click .icon-remove': 'remove',
        'click .icon-plus': 'createResource',
        'click .icon-sitemap': 'openDiagram'
    },

    initialize: function(attributes) {
        _.bindAll(this);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);

        if (this.model) {
            var icon = this.templateIcon();
            var label = this.templateLabel({ uri: this.model.get('uri') });
            var remove = this.templateRemove();
            var dia = this.templateDiagram();
            this.$el.children().remove();
            this.$el.append(icon).append(label).append(remove).append(dia);
        } else {
            var add = this.templateAdd();
            this.$el.children().remove();
            this.$el.append(add);
        }

        return this;
    },
    openEditor: function() {
        if (this.model) {
            this.trigger('open:editor', this.model);
        }
    },
    createResource: function() {
        this.trigger('create', this);
    },
    openDiagram: function() {
        if (this.model) {
            this.trigger('open:diagram', this.model);
        }
    },
    remove: function() {
        this.trigger('remove', this.model);
        return Backbone.View.prototype.remove.apply(this);
    }
});

