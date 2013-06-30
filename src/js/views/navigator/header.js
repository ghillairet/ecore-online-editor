/**
 * NavigatorHeaderView
 *
 */
var NavigatorHeaderView = Backbone.View.extend({
    template: _.template('<div class="nav-header"><div class="nav-header-content"></div></div>'),
//    templateTitle: _.template('<h3>Ecore Editor</h3>'),
    templateHide: _.template('<i class="icon-double-angle-left icon-large"></i>'),
    templateShow: _.template('<i class="icon-double-angle-right icon-large"></i>'),

    events: {
        'click .icon-double-angle-left': 'hide',
        'click .icon-double-angle-right': 'show'
    },

    initialize: function(attributes) {
        _.bindAll(this);
    },

    render: function(hide) {
        if (this.$el) this.remove();

        var html = this.template();
        this.setElement(html);
        var $content = $('.nav-header-content', this.$el),
            icon, title;

        if (hide) {
            icon = this.templateShow();
            $content.append(icon);
        } else {
//            title = this.templateTitle();
            icon = this.templateHide();
            $content.append(icon);
        }

        return this;
    },

    hide: function() {
        this.trigger('hide');
    },

    show: function() {
        this.trigger('show');
    }

});

