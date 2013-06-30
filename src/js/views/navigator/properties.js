
var PropertyView = NavBox.extend({
    title: 'Properties',
    initialize: function(attributes) {
        NavBox.prototype.initialize.apply(this, [attributes]);
    },
    render: function() {
        NavBox.prototype.render.apply(this);
        this.update();
        _.each(this.views, this.renderView, this);
        return this;
    },
    update: function() {
        this.removeViews();
        this.views.length = 0;

        var model = this.model;
        if (model) {
            var filter = function(attr) {
                return !attr.get('many') && !attr.get('derived');
            };
            var features = _.filter(model.eClass.get('eAllAttributes'), filter);
            features = _.union(features, _.filter(model.eClass.get('eAllReferences'), function(r) {
                return !r.get('containment') && !r.get('derived');
            }));
            var label, edit;
            this.views = _.flatten(_.map(features, function(attr) {
                if (attr.get('eType') === Ecore.EBoolean) {
                    return new BooleanView({ model: model, attribute: attr });
                } else if (attr.isTypeOf('EAttribute')) {
                    label = new LabelView({ model: attr.get('name') });
                    edit = new TextView({ model: model, attribute: attr });
                    return [label, edit];
                } else if (attr.get('many')) {
                     label = new LabelView({ model: attr.get('name') });
                     return label;
                } else {
                    label = new LabelView({ model: attr.get('name') });
                    edit = new SingleSelectView({ model: model, reference: attr });
                    return [label, edit];
                }
            }));
        } else {
            this.views = [];
        }
    },
    renderView: function(view) {
        var $v = view.render().$el;
        this.$el.append($v);
    }
});


var RowView = Backbone.View.extend({
    template: '<div class="nav-row"></div>',
    render: function() {
        this.setElement(this.template);
        return this;
    }
});


var LabelView = RowView.extend({
    labelTmpl: _.template(
        '<label class="label-property">' +
            '<%= text %>' +
        '</label>'
    ),
    initialize: function(attributes) {
    },
    render: function() {
        RowView.prototype.render.apply(this);
        this.$el.append(this.labelTmpl({
            text: this.model
        }));
        return this;
    }
});


var TextView = RowView.extend({
    textTmpl: _.template(
        '<div class="text-property" contenteditable="">' +
            '<%= text %>' +
        '</div>'
    ),
    initialize: function(attributes) {
        this.attribute = attributes.attribute;
    },
    render: function() {
        RowView.prototype.render.apply(this);
        this.$el.append(this.textTmpl({
            text: this.model.get(this.attribute)
        }));
        return this;
    }
});


var BooleanView = RowView.extend({
    boolTmpl: _.template(
        '<div class="bool-property">' +
            '<label>' +
                '<input type="checkbox" <% if (value) { %> checked <% } %> >' +
                '<%= label %>' +
            '</label>' +
        '</div>'
    ),
    initialize: function(attributes) {
        this.attribute = attributes.attribute;
    },
    render: function() {
        RowView.prototype.render.apply(this);
        var value = this.model.get(this.attribute) === true ? true : false;
        console.log(this.attribute, value);
        this.$el.append(this.boolTmpl({
            label: this.attribute.get('name'),
            value: value
        }));
        return this;
    }
});


var SingleSelectView = RowView.extend({
    selectTmpl: _.template(
        '<select></select>'
    ),
    initialize: function(attributes) {
        this.reference = attributes.reference;
    },
    render: function() {
        RowView.prototype.render.apply(this);
        this.$el.append(this.selectTmpl({
        }));
        return this;
    }
});

