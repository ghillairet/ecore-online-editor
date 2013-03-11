/**
 * @name NavBox
 */
var NavBox = Backbone.View.extend({
    template: _.template('<div class="nav-box"></div>'),
    templateHeader: _.template('<div class="nav-box-header"><%= title %><i class="icon-large"></i></div>'),

    _icon_up: 'icon-double-angle-up',
    _icon_down: 'icon-double-angle-down',

    events: {
        'click .icon-double-angle-up': 'hide',
        'click .icon-double-angle-down': 'show'
    },
    initialize: function(attributes) {
        this.navigator = attributes.navigator;
        this.views = [];
    },
    render: function() {
        var html = this.template();
        var header = this.templateHeader({ title: this.title });
        this.setElement(html);
        this.$el.append(header);
        $('i[class~="icon-large"]', this.$el).addClass(this._icon_up);

        return this;
    },
    show: function() {
        _.each(this.views, function(view) { this.$el.append(view.render().$el); }, this);
        $('i[class~="'+ this._icon_down + '"]', this.$el)
            .removeClass(this._icon_down)
            .addClass(this._icon_up);
    },
    hide: function() {
        _.each(this.views, function(view) { view.remove(); });
        $('i[class~="' + this._icon_up + '"]', this.$el)
            .removeClass(this._icon_up)
            .addClass(this._icon_down);
    },
    remove: function() {
        _.each(this.views, function(view) { view.remove(); });
        this.views.length = 0;
        return Backbone.View.prototype.remove.apply(this);
    }
});

