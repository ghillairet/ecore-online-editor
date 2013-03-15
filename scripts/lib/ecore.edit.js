(function() {



//
// Ecore.Edit
//

var Edit = Ecore.Edit = {
    version: '0.3.0'
};

//
// LabelProvider
//
// Provides labels for EObjects.
//
// It can be extended to provide labels to different kind of EObject by
// using the extend method provided by underscore:
//
//      _.extend(Ecore.Edit.LabelProvider, {
//          FooClass: function(eObject) { return eObject.get('bar'); }
//      });
//

Edit.LabelProvider = {
    getLabel: function(eObject) {
        var eClass = eObject.eClass.get('name');
        if (this[eClass])
            return this[eClass](eObject);
        else
            return eObject.eClass.get('name');
    },

    // Labels for Ecore classes

    EClass: function(eObject) { return eObject.get('name'); },
    EDataType: function(eObject) { return eObject.get('name'); },
    EEnum: function(eObject) { return eObject.get('name'); },
    EEnumLiteral: function(eObject) { return eObject.get('name') + ' = ' + eObject.get('value'); },
    EAttribute: function(eObject) {
        var type = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + type;
    },
    EReference: function(eObject) {
        var type = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + type;
    },
    EOperation: function(eObject) {
        var returnType = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + '()' + returnType;
    },
    EPackage: function(eObject) { return eObject.get('name'); },
    ResourceSet: function(eObject) { return 'resourceSet'; },
    Resource: function(eObject) { return eObject.get('uri'); }
};



function draggable(element) {
    var header = $('div [class*="window-header"]', $(element));

    header.mousedown(function(e) {
        element.innerX = e.clientX + window.pageXOffset - element.offsetLeft;
        element.innerY = e.clientY + window.pageYOffset - element.offsetTop;

        window.addEventListener('mousemove', move, false);
        window.addEventListener('mouseup', function() {
            window.removeEventListener('mousemove', move, false);
        }, true);

        function move(e) {
            var position = element.style.position;
            element.style.position = 'absolute';
            element.style.left = e.clientX + window.pageXOffset - element.innerX + 'px';
            element.style.top = e.clientY + window.pageYOffset - element.innerY + 'px';
            element.style.position = position;
        }
    });
}

function resizable(view, resizer) {
    var element = view.$el[0];

    resizer.mousedown(function(e) {
        element.startX = e.clientX; // + window.pageXOffset - element.offsetLeft;
        element.startY = e.clientY; // + window.pageYOffset - element.offsetTop;
        element.ow = element.offsetWidth;
        element.oh = element.offsetHeight;

        window.addEventListener('mousemove', move, false);
        window.addEventListener('mouseup', function() {
            window.removeEventListener('mousemove', move, false);
        }, true);

        function move(e) {
            var dX = e.clientX - element.startX;
            var dY = e.clientY - element.startY;

            element.startX += dX; // + window.pageXOffset - element.offsetLeft;
            element.startY += dY; // + window.pageYOffset - element.offsetTop;

            element.ow += dX;
            element.oh += dY;
            var position = element.style.position;
            element.style.position = 'absolute';
            element.style.width = element.ow * 0.9 + 'px';
            element.style.height = element.oh * 0.9 + 'px';
            element.style.position = position;
        }
    });
}

// Window
//

Edit.Window = Backbone.View.extend({
    _template: _.template('<div class="row-fluid"><div class="window-header"><span class="window-title"><%= title %></span><span class="window-actions"></span></div><div class="window-content"></div><div class="window-footer"></div></div>'),

    _resizeHandleTemplate: _.template('<div class="window-resize" style="z-index: 1000;"></div>'),

    _closeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-remove action-close"></i></a>'),
    _minimizeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-minus action-min"></i></a>'),
    _maximizeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-plus action-max"></i></a>'),

    events: {
        'click i[class*="action-close"]': 'close',
        'click i[class*="action-min"]': 'minimize',
        'click i[class*="action-max"]': 'maximize'
    },

    title: 'Window',
    draggable: true,

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'remove', 'close', 'minimize', 'maximize');
        if (!attributes) attributes = {};
        this.parts = attributes.parts;
        if (attributes.title && !this.title) {
            this.title = attributes.title;
        }
        if (attributes.height) {
            this.height = attributes.height;
        }
        if (attributes.draggable) {
            this.draggable = attributes.draggable;
        }
        if (attributes.content) {
            this.content = attributes.content;
        }
    },

    render: function() {
        this.remove();

        var html = this._template({ title: this.title });

        this.$el.addClass('window');
        this.$el.removeClass('hidden');
        this.$el.append(html);
        this.$header = $('.window-header', this.$el);

        $('span[class*="window-actions"]', this.$el)
            .append(this._minimizeActionTemplate())
            .append(this._maximizeActionTemplate())
            .append(this._closeActionTemplate());

        $('.window-footer', this.$el).append(this._resizeHandleTemplate());

        this.$content = $('div > div[class*="window-content"]', this.$el);
        if (this.height)  {
            this.$content.css('height', this.height);
        }

        if (this.content) {
            this.content.setElement(this.$content);
            this.content.render();
        }

        if (this.draggable) draggable(this.$el[0]);
        resizable(this, $('.window-resize', this.$el));

        return this;
    },

    remove: function() {
        if (this.$content) {
            this.$content.remove();
        }
        if (this.$el) {
            this.$el.children().remove();
            this.$el.css('width', null);
            this.$el.css('height', null);
        }
        return this;
    },

    close: function() {
        this.remove();
        this.$el.addClass('hidden');
    },

    maximize: function() {
        this.$el.ot = this.$el.css('top');
        this.$el.ob = this.$el.css('bottom');
        this.$el.or = this.$el.css('right');
        this.$el.ol = this.$el.css('left');
        this.$el.css('top', 10);
        this.$el.css('bottom', 0);
        this.$el.css('left', 0);
        this.$el.css('right', 0);
    },

    minimize: function() {
        if (this.$el.ot) this.$el.css('top', this.$el.ot);
        if (this.$el.ob) this.$el.css('bottom', this.$el.ob);
        if (this.$el.or) this.$el.css('right', this.$el.or);
        if (this.$el.ol) this.$el.css('left', this.$el.ol);
    }
});

Edit.SimpleWindow = Edit.Window.extend({
    header: _.template('<div></div>'),
    initialize: function(attributes) {
        this.title = attributes.title || 'Window';
        this.height = attributes.height;
        this.draggable = attributes.draggable;
        this.content = attributes.content;
    }
});



Edit.MenuBar = Backbone.View.extend({
    template: _.template('<div class="span12 action-bar btn-group"></div>'),

    initialize: function(attributes) {
        this.buttons = attributes.buttons;
    },
    render: function(){
        var html = this.template();
        this.$el.append(html);

        _.each(this.buttons, this.renderButton, this);

        return this;
    },
    renderButton: function(button) {
        button.render();
        $('div[class*="action-bar"]', this.$el).append(button.$el);

        return this;
    }
});

// var add = new MenuBarButton({label: 'add', click: function() {}});
// var bar = new MenuBar({buttons: [add]});

Edit.MenuBarButton = Backbone.View.extend({
    template: _.template('<a class="btn btn-<%= size %>"> <%= label %> </a>'),

    events: {
        'click': 'click'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.size = attributes.size || 'mini';
        this.label = attributes.label;
    },
    render: function() {
        var html = this.template({ label: this.label, size: this.size });
        this.setElement(html);

        return this;
    },
    click: function(e) {
        this.trigger('click', e);
    }
});

Edit.MenuBarDropDownButton = Edit.MenuBarButton.extend({
    template: _.template('<a class="btn btn-<%= size %>" data-toggle="dropdown"> <%= label %> <span class="caret"> </span></a><ul class="dropdown-menu"></ul>'),

    initialize: function(attributes) {
        Edit.MenuBarButton.prototype.initialize.apply(this, [attributes]);

        this.label = attributes.label;
        this.items = attributes.items || [];
    },
    render: function() {
        Edit.MenuBarButton.prototype.render.apply(this);

        this.removeItem();
        _.each(this.items, this.renderItem, this);

        return this;
    },
    renderItem: function(item) {
        item.render();
        // append to ul.
        $(this.$el[1]).append(item.$el);

        return this;
    },
    removeItem: function(item) {
        this.items.length = 0;
        $(this.$el[1]).children().remove();

        return this;
    },
    addItem: function(item) {
        this.items.push(item);

        return this;
    }
});

Edit.Separator = Backbone.View.extend({
    template: _.template('<li class="divider"></li>'),

    render: function() {
        var html = this.template();
        this.setElement(html);
        return this;
    }
});

Edit.DropDownItem = Backbone.View.extend({
    template: _.template('<li><a tabindex="-1" href="#"><%= label %></a></li>'),

    events: {
        'click a': 'click'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.label = attributes.label;
    },
    render: function() {
        var html = this.template({ label: this.label });
        this.setElement(html);

        return this;
    },
    click: function(e) {
        this.trigger('click', e);
    },
    remove: function() {
        Backbone.View.prototype.remove.apply(this);
    }
});



var TextValue = Backbone.View.extend({
    template: '<div contenteditable></div>',

    render: function() {
        this.setElement(this.template);
        this.$el.append(String(this.model || 0));

        var view = this;
        this.$el.on('change', function() {
            view.trigger('change', view.$el.text());
        });

        return this;
    }
});

var DateValue = Backbone.View.extend({});

var SelectValue = Backbone.View.extend({
    templateOptions: _.template(
        '<% _.each(options, function(option) { %> ' +
        '<option> <%= option.eClass ? ' +
        'Ecore.Edit.LabelProvider.getLabel(option) : option %>' +
        '</option> <% }); %>'),

    initialize: function(attributes) {
        attributes || (attributes = {});
        this.value = attributes.value;
        this.options = attributes.options;
    },

    getLabel: function(value) {
        if (value)
            if (value.eClass)
                return Edit.LabelProvider.getLabel(value);
            else return value;
        else return '';
    },

    getValue: function() {
        var changed = $('option:selected', this.$el).val();
        return _.find(this.options, function(opt) {
            return this.getLabel(opt) === changed;
        }, this);
    },

    render: function() {
        var html = this.templateOptions({ options: this.options });
        this.$el.append(html);

        if (this.value === true || this.value === false) {
            this.$el.val(''+this.value);
        } else {
            this.$el.val(this.getLabel(this.value));
        }

        var view = this;
        this.$el.change(function() {
            var value = view.getValue();
            view.trigger('change', value);
        });

        return this;
    }
});

var SingleValueSelect = SelectValue.extend({
    template: _.template('<select></select>'),

    initialize: function(attributes) {
        SelectValue.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);
        return SelectValue.prototype.render.apply(this);
    }
});

var MultiValueSelect = SelectValue.extend({
    template: _.template('<select multiple="multiple"></select>'),
    templateActions: _.template('<div class="btn-group"></div>'),
    templateAddAction: _.template('<a class="btn-mini"><i class="icon-plus"></i></a>'),
    templateDelAction: _.template('<a class="btn-mini"><i class="icon-remove"></i></a>'),

    initialize: function(attributes) {
        SelectValue.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);

        SelectValue.prototype.render.apply(this);

        var div = $(document.createElement('div'));
        div.append(this.$el);
        this.setElement(div);

        return this;
    }
});



Edit.PropertyRow = Backbone.View.extend({
    propertyTemplate: _.template('<tr><td><%= name %></td></tr>'),
    valueTemplate: _.template('<td></td>'),

    initialize: function(attributes) {
        _.bindAll(this, 'renderEReference', 'renderEAttribute', 'renderEAttributeBoolean', 'render');

        if (_.isObject(this.model.eFeature)) {
            this.eFeature = this.model.eFeature;
            this.eFeatureName = this.eFeature.get('name');
            this.eType = this.eFeature.get('eType');
        } else {
            this.eFeatureName = this.model.eFeature;
        }

        this.value = this.model.value;

        if (this.model.options) {
            this.options = this.model.options;
        } else {
            if (this.eFeature.get('upperBound') !== 1) {
                this.options = this.model.eObject.get(this.eFeatureName).array();
            } else {
                this.options = getElements(this.model.eObject, this.eFeature);
            }
        }
    },

    renderEAttribute: function(model, eFeature, value) {
        var view;

        if (eFeature.get('many')) {

        } else {
            if (eFeature.get('eType') === Ecore.EBoolean)
                view = this.renderEAttributeBoolean(model, eFeature, value || false);
            else {
                view = new TextValue({ model: value });
                view.on('change', function(changed) {
                    model.set(eFeature.get('name'), changed);
                });
            }
        }

        return view;
    },

    renderEAttributeBoolean: function(model, eFeature, value) {
        var view = new SingleValueSelect({
            options: ['true', 'false'],
            value: value
        });

        view.on('change', function(changed) {
            model.set(eFeature.get('name'), changed);
        });

        return view;
    },

    renderEReference: function(model, eFeature, value) {
        var view, changer;
        if (eFeature.get('upperBound') !== 1) {
            view = new MultiValueSelect();
            changer = function(changed) {
                model.get(eFeature).add(changed);
            };
        } else {
            view = new SingleValueSelect();
            changer = function(changed) {
                model.set(eFeature.get('name'), changed);
            };
        }
        view.value = value;
        view.options = this.options;
        view.on('change', changer);

        return view;
    },

    render: function() {
        var model = this.model.eObject,
            value = this.value || model.get(this.eFeatureName),
            html = this.propertyTemplate({ name: this.eFeatureName }),
            view;

        this.setElement(html);

        if (this.eFeature) {
            if (this.eFeature.isTypeOf('EAttribute')) {
                view = this.renderEAttribute(model, this.eFeature, value);
            } else {
                view = this.renderEReference(model, this.eFeature, value);
            }
        } else {
            view = new SingleValueSelect({
                model: [value],
                value: value,
                options: this.options
            });
        }

        if (view) {
            view.render();
            var td = $(document.createElement('td'));
            td.append(view.$el);
            this.$el.append(td);
        }

        return this;
    },

    remove: function() {
        this.$el.remove();

        return this;
    }

});


function getElements(eObject, eFeature) {
    var type = eFeature.get('eType');
    var resourceSet = eObject.eResource().get('resourceSet');
    var elements = resourceSet.elements();
    return _.filter(elements, function(e) {
        return e.isKindOf(type);
    });
}



$('[contenteditable]').live('focus', function() {
    var $this = $(this);
    $this.data('before', $this.html());
    return $this;
}).live('blur keyup paste', function() {
    var $this = $(this);
    if ($this.data('before') !== $this.html()) {
        $this.data('before', $this.html());
        $this.trigger('change');
    }
    return $this;
});

// PropertySheetView
//

Edit.PropertySheet = Backbone.View.extend({
    template: _.template('<table class="table table-striped"></table>'),
    templateTableHead: _.template('<thead><tr><th style="width: 30%"></th><th style="width: 70%"></th></tr></thead>'),
    templateTableBody: _.template('<tbody></tbody>'),

    initialize: function(attributes) {
        this.views = [];
    },

    remove: function() {
        if (this.$el) {
            this.$el.children().remove();
            _.each(this.views, function(v) { v.remove(); });
            this.views.length = 0;
        }
        return this;
    },

    render: function() {
        if (!this.model || !this.model.eClass) return;
        this.remove();

        var html = this.template(),
            htmlHead = this.templateTableHead(),
            htmlBody = this.templateTableBody();

        this.$el.append(html);

        $('table', this.$el)
            .append(htmlHead)
            .append(htmlBody);

        this.tbody = $('table > tbody', this.$el);

        return this.renderContent();
    },

    createRow: function(feature, model, value, options) {
        var view =
            new Edit.PropertyRow({
                model: {
                    eFeature: feature,
                    eObject: model,
                    value: value,
                    options: options
                }
            });
        this.views.push(view);
    },

    createFeatureRow: function(f) {
        return this.createRow(f, this.model);
    },

    renderRow: function(r) {
        r.render();
        this.tbody.append(r.$el);
    },

    renderContent: function() {
        var eClass = this.model.eClass,
            attrs = _.filter(eClass.get('eAllAttributes'), function(f) { return !f.get('derived'); }),
            refs = _.filter(eClass.get('eAllReferences'), function(f) { return !f.get('derived'); }),
            resourceSet, eClasses;

//      resourceSet = this.model.eResource().get('resourceSet');
//      if (resourceSet) eClasses = resourceSet.elements('EClass');
//      this.createRow('eClass', this.model, this.model.eClass, eClasses);
        _.each(attrs, this.createFeatureRow, this);
        _.each(refs, this.createFeatureRow, this);
        _.each(this.views, this.renderRow, this);

        return this;
    }
});



Edit.Tab = Backbone.View.extend({
    template: _.template('<li><a href="#tab-<%= id %>" data-toggle="tab"> <%= title %> <i class="icon-remove-circle"></i> </a></li>'),

    events: {
        'click a > i[class="icon-remove-circle"]': 'remove'
    },

    initialize: function(attributes) {
        this.editor = attributes.editor;
        this.isRender = false;
    },
    render: function() {
        if (!this.isRender) {
            var title = this.editor.getTitle();
            var html = this.template({ id: this.editor.cid, title: title });
            this.setElement(html);
            this.isRender = true;
        }
        return this;
    },
    remove: function() {
        this.trigger('remove');
        return Backbone.View.prototype.remove.apply(this);
    }
});


/**
 * @name TreeNode
 * @class
 *
 */
Edit.TreeNode = Backbone.View.extend(/** @lends TreeNode.prototype */ {
    template: '<tr class="tree-item-tr"></tr>',
    table: '<table style="border-collapse; collapse; margin-left: 0px;"><tbody><tr></tr></tbody></table>',
    td: '<td class="tree-td"></td>',

    events: {
        'mouseover': 'highlight',
        'mouseout': 'unhighlight',
        'click': 'select'
    },

    initialize: function(attributes) {
        this.tree = attributes.tree;
        this.parent = attributes.parent;
        this.margin = attributes.margin;
        this.children = [];
        _.bindAll(this, 'render', 'select', 'expand', 'collapse', 'highlight', 'unhighlight');
    },
    render: function() {
        if (this.$el) {
            this.$el.children().remove();
        } else {
            this.setElement(this.template);
        }
        if (this.model) {
            this.$el.append(this._createLabelElemnt());
        } else {
            this.$el.append(this._createAddElement());
        }
        return this;
    },
    highlight: function() {
        this.$el.css('background', 'rgba(255, 255, 102, 0.6)');
        this.$el.css('cursor', 'pointer');
        return this;
    },
    unhighlight: function() {
        if (this.tree.selected !== this) {
            this.$el.css('background', 'rgba(255, 255, 255, 1)');
        }
        this.$el.css('cursor', 'auto');
        return this;
    },
    select: function(e) {
        if (e) e.stopImmediatePropagation();
        if (this.$el) {
            this.$el.css('background', 'rgba(255, 255, 102, 0.4)');
        }
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
        this.tree.setSelection(this);
        return this;
    },
    deselect: function() {
        if (this.$el) {
            this.$el.css('background', 'rgba(255, 255, 255, 1)');
        }
        return this;
    },
    addNode: function(model) {
        var previous = _.last(this.children);
        var view = new Edit.TreeNode({
            model: model,
            tree: this.tree,
            parent: this,
            margin: this.margin + 24
        });

        if (previous) previous.next = view;

        this.children.push(view);
        view.render();

        if (this.next && this.next !== this) {
            this.tree.$tbody[0].insertBefore(view.$el[0], this.next.$el[0]);
        } else {
            this.tree.$tbody.append(view.$el);
        }
        return this;
    },
    expand: function() {
        if (this.expanded) this.collapse();
        this.expanded = true;
        var contents = this.model.eContents();
        _.each(contents, this.addNode, this);
        return this;
    },
    collapse: function() {
        this.expanded = false;
        _.each(this.children, function(c) { c.remove(); });
        this.children.length = 0;
        return this;
    },
    remove: function() {
        _.each(this.children, function(c) { c.remove(); });
        Backbone.View.prototype.remove.apply(this);
        this.children.length = 0;
        return this;
    },


    // private methods


    _createAddElement: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        var add = document.createElement('a');
        add.className = 'icon-plus icon-large';
        td.appendChild(add);
        return td;
    },
    _createOrderElement: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        if (this.parent) {
            var reorder = document.createElement('a');
            reorder.className += ' icon-reorder icon-large';
            reorder.style.color = 'grey';
            td.appendChild(reorder);
        }
        return td;
    },
    _createLabelElemnt: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        var table = this._createInnerTable();
        td.appendChild(table.table);

        var label = Edit.LabelProvider.getLabel(this.model);
        table.label.innerHTML = label;

        return td;
    },
    _createEditElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var copy = document.createElement('div');
        copy.className = 'icon-edit icon-large';
        td.appendChild(copy);
        return td;
    },
    _createDeleteElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var del = document.createElement('div');
        del.className = 'icon-remove icon-large';
        td.appendChild(del);

        return td;
    },
    _createInnerTable: function() {
        var table = document.createElement('table');
        table.style.marginLeft = this.margin + 'px';
        table.style.borderCollapse = 'collapse';
        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        var td_btn = document.createElement('td');
        td_btn.className = 'tree-td';
        var btn = document.createElement('a');
        btn.className = 'icon-caret-right';
        btn.style.color = 'grey';
        btn.style.cursor = 'pointer';
        var td_label = document.createElement('td');
        td_label.className = 'tree-td';
        var div_label = document.createElement('div');
        div_label.className = 'tree-label';
        var td_icon = document.createElement('td');
        td_icon.className = 'tree-td';
        var span_icon = document.createElement('span');
        span_icon.className = 'icon-edit-' + this.model.eClass.get('name');

        td_btn.appendChild(btn);
        tr.appendChild(td_btn);
        tr.appendChild(td_icon);
        td_icon.appendChild(span_icon);
        td_label.appendChild(div_label);
        tr.appendChild(td_label);
        tbody.appendChild(tr);
        table.appendChild(tbody);

        return { table: table, label: div_label };
    }

});



/**
 * @name Tree
 * @class Display Ecore elements in a Tree.
 *
 */
Edit.Tree = Backbone.View.extend(/** @lends Tree.prototype */ {
    template: _.template('<table class="tree-table"></table>'),
    tableTmpl: _.template('<colgroup><col></colgroup><tbody></tbody>'),

    initialize: function(attributes) {
        this.selected = null;
        this.nodes = [];
    },

    render: function() {
        if (!this.$body) {
            this.setElement(this.template());
            this.$el.append(this.tableTmpl());
            this.$tbody = $('tbody', this.$el);

            var previous, current;
            this.model.get('contents').each(this.addNode, this);
        }

        return this;
    },

    addNode: function(model) {
        var previous = _.last(this.nodes);
        var view = new Edit.TreeNode({ model: model, tree: this, margin: 0 });
        if (previous) previous.next = view;

        this.nodes.push(view);
        view.render();
        this.$tbody.append(view.$el);
    },

    expand: function() {
        if (this.$frame) {
            this.$frame.expand();
        }
        return this;
    },

    setSelection: function(view) {
        if (this.selected) {
            this.selected.deselect();
            this.trigger('deselect', this.selected);
        }
        this.selected = view;
        this.trigger('select', this.selected);
    },

    remove: function() {
        if (this.$body) this.$body.remove();
        _.each(this.nodes, function(node) { node.remove(); });
        return Backbone.View.prototype.remove.apply(this);
    }
});


/**
 * @name Editor
 * @class
 *
 */
Edit.Editor = Backbone.View.extend(/** @lends Edior.prototype */ {
    menu: false,

    _frame: '<div class="editor-frame"></div>',
    _menu: '<div class="editor-menu"></div>',
    _content: '<div class="editor-content-outer"><div class="editor-content"></div></div>',

    initialize: function(attributes) {},

    render: function() {
        var $frame;

        if (!this.$content) {
            this.setElement(this.template({ id: this.cid }));
            this.$el.addClass('editor');
            this.$el.append(this._frame);
            $frame = $('.editor-frame', this.$el);

            if (this.menu) {
                $frame.append(this._menu);
                this.$menu = $('.editor-menu', $frame);
            }

            $frame.append(this._content);
            this.$content = $('.editor-content', $frame);

            if (this.$container) {
                this.$container.append(this.$el);
            }

            this.renderContent();
        }

        return this;
    },

    renderContent: function() {},

    remove: function() {
        this.trigger('remove');
        return Backbone.View.prototype.remove.apply(this);
    }

});

/**
 * @name TabEditor
 * @class
 *
 */
Edit.TabEditor = Edit.Editor.extend(/** @lends TabEdior.prototype */ {
    template: _.template('<div class="tab-pane" id="tab-<%= id %>"></div>'),

    initialize: function(attributes) {
        Edit.Editor.prototype.initialize.apply(this, [attributes]);
        this.tab = new Edit.Tab({ editor: this, model: this.model, title: attributes.title });
        this.tab.on('remove', this.remove);
    },

    render: function() {
        if (this.$tabs && !this.tab.isRender) {
            this.$tabs.append(this.tab.render().$el);
        }

        Edit.Editor.prototype.render.apply(this);

        return this;
    },

    show: function() {
        $('a[href="#tab-' +  this.cid + '"]', this.$tabs).tab('show');
    },

    getTitle: function() {
        var uri;
        if (this.title) {
            return this.title;
        } else if (this.model) {
            uri = this.model.get('uri');
            return uri.slice(uri.lastIndexOf('/') + 1, uri.length);
        }
        else {
            return 'unnamed';
        }
    }

});


/**
 * @name TreeTabEdior
 * @class
 *
 */
Edit.TreeTabEditor = Edit.TabEditor.extend(/** @lends TreeTabEdior.prototype */ {
    menu: true,
    _menuGroup: '<div class="btn-group"></div>',

    initialize: function(attributes) {
        _.bindAll(this);
        Edit.TabEditor.prototype.initialize.apply(this, [attributes]);
        this.tree = new Ecore.Edit.Tree({ model: this.model });
        this.model.on('change add', function(changed) {
            var selected = this.tree.selected;
            if (selected)  {
                selected.render();
                if (selected.expanded) selected.expand();
            }
        }, this);
        this.model.on('remove', function(list) {
            if (this.tree.selected.parent) {
                this.tree.setSelection(this.tree.selected.parent);
                this.tree.selected.expand();
            }
        }, this);
    },

    renderContent: function() {
        this.$content.append(this.tree.render().$el);
        this.$menu.append(this._createMenu());
    },

    addElement: function(e) {
        var selection = this.tree.selected;
        if (!selection) return;

        var menu = this.add;
        var model = selection.model;
        var child = model.eClass.get('eAllContainments');
        var eContainingFeature = model.eContainingFeature;

        menu.removeItem();
        _.each(child, function(c) {
            createChildItems.apply(menu, [c, model]);
        });

        if (eContainingFeature) {
            var eType = eContainingFeature.get('eType');
            var siblings = eType.get('abstract') ? eType.get('eAllSubTypes') : [eType];
            var label, item;

            if (child.length) menu.addItem(new Edit.Separator());

            _.each(siblings, function(type) {
                label = 'Sibling ' + type.get('name');
                item = new Edit.DropDownItem({ label: label });
                menu.addItem(item);
                item.on('click', createSiblingItems(type, eContainingFeature, model, this));
            }, this);
        }

        _.each(menu.items, menu.renderItem, menu);
    },

    removeElement: function() {
        var selection = this.tree.selected;
        if (!selection) return;

        var eContainingFeature = selection.model.eContainingFeature,
            eContainer = selection.model.eContainer;

        if (eContainer) {
            if (eContainingFeature.get('upperBound') !== 1) {
                eContainer.get(eContainingFeature).remove(selection.model);
            } else {
                eContainer.set(eContainingFeature.get('name'), null);
            }
        } else {
            selection.model.eResource().get('contents').remove(selection.model);
        }
    },

    editElement: function() {},

    _createMenu: function() {
        var $group = $(this._menuGroup);

        this.add = new Edit.MenuBarDropDownButton({ label: 'add', size: 'small' });
        this.remove = new Edit.MenuBarButton({ label: 'remove', size: 'small' });
        this.edit = new Edit.MenuBarButton({ label: 'edit', size: 'small' });

        this.add.on('click', this.addElement);
        this.remove.on('click', this.removeElement);
        this.edit.on('click', this.editElement);

        $group.append(this.add.render().$el)
            .append(this.remove.render().$el)
            .append(this.edit.render().$el);

        return $group;
    }
});

/*
 * Helper functions
 */

function createSiblingItems(type, feature, model, editor) {
    return function() {
        var eContainer = model.eContainer;
        if (eContainer) {
            // change selection for rendering new content
            editor.tree.setSelection(editor.tree.selected.parent);
            if (feature.get('upperBound') !== 1) {
                eContainer.get(feature).add(type.create());
            } else {
                eContainer.set(feature.get('name'), type.create());
            }
        }
    };
}

function createChildItems(feature, model) {
    var eType = feature.get('eType');
    var types = eType.get('abstract') ? eType.get('eAllSubTypes') : [eType];
    var item, label;

    _.each(types, function(type) {
        label = 'Child ' + type.get('name');
        item = new Edit.DropDownItem({ label: label, model: type });

        item.on('click', function() {
            if (feature.get('upperBound') === 1) {
                model.set(feature.get('name'), type.create());
            } else {
                model.get(feature).add(type.create());
            }
        });

        this.addItem(item);
    }, this);
}


/**
 * @name TabPanel
 * @class
 */
Edit.TabPanel = Backbone.View.extend(/** @lends TabPanel.prototype */ {
    template: _.template('<ul class="nav nav-tabs"></ul> <div class="tab-content"></div>'),

    initialize: function(attributes) {
        this.editors = [];
    },
    render: function() {
        if (!this.$content && !this.$tabs) {
            var html = this.template();
            this.$el.addClass('tabbable');

            this.$el.append(html);

            this.$content = $('.tab-content', this.$el);
            this.$tabs = $('.nav-tabs', this.$el);
        }

        _.each(this.editors, function(e) { e.render(); });

        return this;
    },
    add: function(editor) {
        if (this.$content && this.$tabs) {
            editor.$container = this.$content;
            editor.$tabs = this.$tabs;
            this.editors.push(editor);

            editor.on('remove', function() { this.suppress(editor); }, this);
        }
    },
    get: function(editor) {
        return _.find(this.editors, function(e) { return e === editor; });
    },
    getByModel: function(model) {
        return _.find(this.editors, function(e) { return e.model === model; });
    },
    suppress: function(editor) {
        this.editors = _.without(this.editors, editor);
    },
    show: function(model) {
        this.getByModel(model).show();
    },
    open: function(model) {
        var editor = this.getByModel(model);
        if (!editor) {
            editor = new Edit.TabEditor({ model: model });
            this.add(editor);
            editor.render();
        }
        editor.show();
    }
});



})();
