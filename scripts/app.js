
var EReferenceConnection = Ds.Connection.extend({
    figure: {
        stroke: 'black',
        'stroke-width': 2
    },
    end: {
        type: 'basic'
    },
    labels: [
        { text: 'property', position: 'end' }
    ],
    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
            this.labels[0].set('text', this.model.get('name'));
        }
    }
});

var ESuperTypesConnection = Ds.Connection.extend({
    figure: {
        stroke: 'black',
        'stroke-width': 2
    },
    end: {
        fill: 'white',
        type: 'basic'
    }
});


var FeatureShape = Ds.Label.extend({
    resizable: false,
    draggable: false,
    selectable: false,

    figure: {
        type: 'text',
        position: 'left'
    },

    gridData: {
        horizontalAlignment: 'beginning',
        verticalAlignment: 'center',
        grabExcessHorizontalSpace: true
    }

});

var FeatureCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 20,
        width: 100,
        fill: '235-#F9F9D8-#FFFFFF',
        'fill-opacity': 0,
        stroke: '#D8D8D1',
        'stroke-width': 2
    },

    layout: {
        type: 'grid',
        marginHeight: 8,
        marginWidth: 8,
        vgap: 8,
        columns: 1
    },

    gridData: {
        horizontalAlignment: 'fill',
        verticalAlignment: 'fill',
        grabExcessHorizontalSpace: true
    }
});


var EAttributeShape = FeatureShape.extend({

    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
        }

        var text = this.model.get('name');
        if (this.model.has('eType'))
            text += ' : ' + this.model.get('eType').get('name');
        this.setText(text);

        this.on('change:text', function(label) {
            var text = label.getText();
            var split = text.split(':');
            var name = split[0].trim();
            var type;
            if (split.length > 1) {
                type = split[1].trim();
            }
            this.model.set('name', name);
        }, this);
    }
});

var EAttributeCompartment = FeatureCompartment.extend({

    accepts: [ EAttributeShape ],

    initialize: function() {
        this.on('click', this.addElement);
        this.on('mouseover', this.handleMouseOver);
        this.on('mouseout', this.handleMouseOut);
    },

    handleMouseOut: function() {
        this.set('cursor', 'default');
    },

    handleMouseOver: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        var fnShape;

        if (selected) {
            fnShape = selected.shape;
            if (this.canAdd(fnShape)) {
                this.set('cursor', 'copy');
            } else {
                this.set('cursor', 'no-drop');
            }
        }
    },

    addElement: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        if (selected) {
            if (this.canAdd(selected.shape)) {
                var shape = new selected.shape({});
                this.add(shape);
                this.parent.render();
                palette.selected = null;

                var eClass = this.parent.model;
                if (shape instanceof EAttributeShape) {
                    eClass.get('eStructuralFeatures').add(shape.model);
                } else if (shape instanceof EOperationShape) {
                    eClass.get('eOperations').add(shape.model);
                }
            }
        }
    }
});


var EOperationShape = FeatureShape.extend({
    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EOperation.create({ name: 'name', eType: Ecore.EString });
        }

        var type = this.model.get('eType');
        type = type ? type.get('name') : '';
        var text = this.model.get('name') + '(): ' + type;
        this.setText(text);
    }
});

var EOperationCompartment = FeatureCompartment.extend({

    accepts: [ EOperationShape ],

    initialize: function() {
        this.on('click', this.addElement);
        this.on('mouseover', this.handleMouseOver);
        this.on('mouseout', this.handleMouseOut);
    },

    handleMouseOut: function() {
        this.set('cursor', 'default');
    },

    handleMouseOver: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        var fnShape;

        if (selected) {
            fnShape = selected.shape;
            if (this.canAdd(fnShape)) {
                this.set('cursor', 'copy');
            } else {
                this.set('cursor', 'no-drop');
            }
        }
    },

    addElement: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        if (selected) {
            if (this.canAdd(selected.shape)) {
                var shape = new selected.shape({});
                this.add(shape);
                this.parent.render();
                palette.selected = null;
            }
        }
    }

});


var ClassifierLabel = {

    figure: {
        type: 'text',
        'font-size': 14,
        'font-weight': 'bold',
        height: 30
    },

    gridData: {
        horizontalAlignment: 'center',
        grabExcessHorizontalSpace: true
    }

};

var ClassifierShape = Ds.Shape.extend({

    figure: {
        type: 'rect',
        width: 160,
        height: 100,
        fill: '235-#F9F9D8-#FFFFFF',
        opacity: 1,
        stroke: '#D8D8D1',
        'stroke-width': 2,
        'stroke-opacity': 1
    },

    layout: {
        type: 'grid',
        columns: 1,
        hgap: 0,
        vgap: 0,
        marginHeight: 0,
        marginWidth: 0
    }

});


// EEnumLiteralShape

var EEnumLiteralShape = FeatureShape.extend({
});

var EEnumCompartment = FeatureCompartment.extend({

    accepts: [
        EEnumLiteralShape
    ]

});


// EEnumShape

var EEnumShape = ClassifierShape.extend({

    children: [
        ClassifierLabel,
        EEnumCompartment
    ],

    initialize: function(attributes) {
        if (!this.diagram) return; // dummies

        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EEnum.create({ name: 'EEnum' });
            this.diagram.model.get('eClassifiers').add(this.model);
        }
        this.children[0].setText(this.model.get('name'));
    }
});



var EDataTypeCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 20,
        fill: 'white',
        'fill-opacity': 0,
        stroke: '#D8D8D1',
        'stroke-width': 2
    },

    gridData: {
        horizontalAlignment: 'fill',
        verticalAlignment: 'fill',
        grabExcessHorizontalSpace: true
    }

});

var EDataTypeShape = ClassifierShape.extend({

    children: [
        ClassifierLabel,
        EDataTypeCompartment
    ],

    initialize: function(attributes) {
        if (!this.diagram) return; // dummies

        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EDataType.create({ name: 'EDataType' });
            this.diagram.model.get('eClassifiers').add(this.model);
        }
        this.children[0].setText(this.model.get('name'));
    }
});


var EClassShape = ClassifierShape.extend({

    children: [
        ClassifierLabel,
        EAttributeCompartment,
        EOperationCompartment
    ],

    initialize: function(attributes) {
        if (!this.diagram) return; // dummies
        if (attributes.model) {
            this.model = attributes.model;
            this.model.shape = this;
            this.createContent();
        } else {
            this.model = Ecore.EClass.create({ name: 'MyClass' });
            this.model.shape = this;
            this.diagram.model.get('eClassifiers').add(this.model);
        }

        this.children[0].setText(this.model.get('name'));
        this.on('click', this.toFront);
        this.on('mousedown', this.doConnect);
    },

    doConnect: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        if (selected && selected.connection) {
            this.dragConnection(e, selected.connection);
            this.on('connect:source', function() { palette.selected = null; });
        }
    },

    createContent: function() {
        _.each(this.model.get('eAttributes'), function(a) {
            var shape = this.diagram.createShape(EAttributeShape, { model: a });
            this.children[1].add(shape);
        }, this);

        this.model.get('eOperations').each(function(o) {
            var shape = this.diagram.createShape(EOperationShape, { model: o });
            this.children[2].add(shape);
        }, this);
    }

});



var EPackageCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        fill: '270-#B8A8C8-#FFF',
        height: 100,
        stroke: 'grey'
    },

    initialize: function() {
        this.on('click', function() {
            this.parent.select();
        }, this);
    }
});

var EPackageHeadShape = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 30,
        fill: 'none',
        stroke: 'none'
    },

    layout: { type: 'xy' },

    children: [
        {
            draggable: false,
            selectable: false,
            resizable: false,

            figure: {
                type: 'rect',
                height: 30,
                width: 80,
                x: 0,
                y: 0,
                stroke: 'grey',
                fill: '#B8A8C8'
            },

            layout: {
                type: 'grid',
                columns: 1,
                marginHeight: 5,
                marginWidth: 5
            },

            children: [
                {
                    figure: {
                        type: 'text',
                        'font-size': 11,
                        text: 'EPackage'
                    },

                    gridData: {
                        horizontalAlignment: 'center',
                        grabExcessHorizontalSpace: true,
                        grabExcessVerticalSpace: true
                    }
                }
            ]
        }
    ]
});

var EPackageShape = Ds.Shape.extend({

    figure: {
        type: 'rect',
        fill: 'yellow',
        'fill-opacity': 0,
        stroke: 'none',
        height: 120,
        width: 160
    },

    initialize: function(attributes) {
        if (!this.diagram) return;

        var head = new EPackageHeadShape({ diagram: this.diagram });
        var body = new EPackageCompartment({ diagram: this.diagram });
        this.add(head);
        this.add(body);
        this.layout.north = head;
        this.layout.center = body;

        this.on('click', this.select);
    },

    layout: {
        type: 'border',
        vgap: 0,
        hgap: 0
    }
});


var current = { x: 0, y: 100 };
function layout() {
    var ws = 10, we = 800,
        pad = 150;

    if (we > (current.x + pad)) {
        current.x = current.x + pad;
        current.y = current.y;
    } else {
        current.x = ws;
        current.y = current.y + pad;
    }
    return current;
}

var EcoreDiagram = Ds.Diagram.extend({
    width: 2000,
    height: 2000,

    children: [
        EPackageShape,
        EClassShape,
        EDataTypeShape,
        EEnumShape
    ],

    initialize: function(attributes) {
        _.bindAll(this);
        if (attributes.model) {
            this.model = attributes.model;
            this.createContent();
            this.createConnections();
        } else {
            this.model = Ecore.EPackage.create({
                name: 'sample',
                nsURI: 'http://www.example.org/sample',
                nsPrefix: 'sample'
            });
            var res = resourceSet.create({ uri: 'sample.ecore' });
            res.get('contents').add(this.model);
        }

        this.on('click', this.addFromPalette);
        this.on('click', function() { Workbench.palette.selected = null; });
        this.on('mouseover', this.handleMouseOver);
    },

    handleMouseOver: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;

        if (selected) {
            if ( _.contains(['EClass', 'EDataType', 'EEnum', 'EPackage'], selected.title) ) {
                this.wrapper.attr('cursor', 'copy');
            } else {
                this.wrapper.attr('cursor', 'no-drop');
            }
        } else {
            this.wrapper.attr('cursor', 'default');
        }
    },

    addFromPalette: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;

        if (selected && typeof selected.shape === 'function') {
            this.createShape(selected.shape, Ds.Point.get(this, e)).render();
            palette.selected = null;
        }
    },

    createContent: function() {
        this.model.get('eClassifiers').each(function(c) {
            if (c.isTypeOf('EClass')) {
                var position = layout();
                //this.createShape(EClassShape, { model: c, x: position.x, y: position.y });
                var x = 100, y = 100;
                this.createShape(EClassShape, { model: c, x: x, y: x });
            }
        }, this);
    },

    createConnections: function() {
        var connect;
        this.model.get('eClassifiers').each(function(c) {
            if (c.isTypeOf('EClass')) {
                /**
                c.get('eSuperTypes').each(function(e) {
                    connect = this.createConnection(ESuperTypes, {
                        source: c.shape,
                        target: e.shape
                    });
                }, this);

                _.each(c.get('eReferences'), function(e) {
                    connect = this.createConnection(EReference, {
                        source: c.shape,
                        target: e.get('eType').shape,
                        model: e
                    });
                }, this);
                */
            }
        }, this);
    }

});


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


/**
 * NavigatorHeaderView
 *
 */
var NavigatorHeaderView = Backbone.View.extend({
    template: _.template('<div class="nav-header"><div class="nav-header-content"></div></div>'),
    templateTitle: _.template('<h3>Ecore Editor</h3>'),
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
            title = this.templateTitle();
            icon = this.templateHide();
            $content.append(title).append(icon);
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


/**
 * @name PaletteView
 *
 */
var PaletteView = NavBox.extend({
    title: 'Palette',

    tools: {

    },

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

var ToolItemView = PaletteItemView.extend({
    template: _.template('<i class="<%= icon %>"></i><span><%= title %></span>'),
    initialize: function(attributes) {
        PaletteItemView.prototype.initialize.apply(this, [attributes]);
        this.icon = attributes.icon;
    }
});


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

        this.header = new NavigatorHeaderView();
        this.header.on('hide', this.hide);
        this.header.on('show', this.show);
    },

    render: function() {
        this.$header = this.header.render().$el;
        this.$el.append(this.$header);
        this.$el.append(this.resourceSetView.render().$el);
        this.$el.append(this.paletteView.render().$el);

        return this;
    },

    hide: function() {
        this.trigger('hide');
        this.resourceSetView.remove();
        this.paletteView.remove();
        this.$header = this.header.render(true).$el;
        this.$el.append(this.$header);
        this.$el.animate({ width: '30px' }, 100);
    },

    show: function() {
        this.trigger('show');
        this.$el.animate({ width: '280px' }, 100);
        this.render();
    }

});




var ModalView = Backbone.View.extend({
    template: _.template('<div id="<%= id =>" class="modal hide fade"></div>'),
    templateHeader: _.template('<div class="modal-header"></div>'),
    templateBody: _.template('<div class="modal-body"></div>'),
    templateFooter: _.template('<div class="modal-footer"><a href="#" class="btn mclose">Close</a><a href="#" class="btn confirm">Confirm</a></div>'),

    render: function() {
        var html = this.template({ id: this.cid });
        var header = this.templateHeader();
        var body = this.templateBody();
        var footer = this.templateFooter();

        this.setElement(html);
        this.$el.append(header);
        this.$el.append(body);
        this.$el.append(footer);

        this.$header = $('div[class="modal-header"]', this.$el);
        this.$body = $('div[class="modal-body"]', this.$el);
        this.$footer = $('div[class="modal-footer"]', this.$el);

        return this;
    },

    show: function() {
        this.$el.modal('show');
    },

    hide: function() {
        this.$el.modal('hide');
    }

});

var CreateResourceModal = ModalView.extend({
    templateForm: _.template('<form class="form-horizontal"></form>'),
    templateControlURI: _.template('<div class="control-group"><label class="control-label" for="inputURI">URI</label><div class="controls"><input type="text" id="inputURI" placeholder="URI"></div></div>'),
    templateControlElement: _.template('<div class="control-group"><label class="control-label" for="inputElement">Element</label><div class="controls"><select type="text" id="selectElement"></select></div>'),
    templateHeaderContent: _.template('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>Create Resource</h3></div>'),
    templateOptions: _.template('<% _.each(options, function(option) { %> <option><%= option.get("name") %></option> <% }); %>'),

    events: {
        'click .modal-footer a[class~="confirm"]': 'onConfirm',
        'click .modal-footer a[class~="mclose"]': 'onClose'
    },

    initialize: function() {
        _.bindAll(this, 'onConfirm');
    },

    render: function() {
        ModalView.prototype.render.apply(this);

        var html = this.templateForm();
        var header = this.templateHeaderContent();
        var cURI = this.templateControlURI();
        var cElt = this.templateControlElement();

        this.$header.append(header);
        this.$body.append(html);
        this.$form = $('form', this.$body);
        this.$form.append(cURI).append(cElt);

        this.$select = $('#selectElement', this.$form);
        this.classes = this.model.elements('EClass');
        this.classes = _.filter(this.classes, function(c) { return !c.get('abstract'); });

        var options = this.templateOptions({ options: this.classes });
        this.$select.append(options);

        return this;
    },

    createResource: function(uri, eClass) {
        var res = this.model.create({ uri: uri });
        res.get('contents').add(eClass.create());
        this.model.trigger('change add', res);
    },

    onClose: function() {
        this.hide();
    },

    onConfirm: function() {
        var uri = $('#inputURI', this.$form).val();
        var element = $('option:selected', this.$select).val();

        if (uri && uri.length && element) {
            var eClass = _.find(this.classes, function(c) { return c.get('name') === element; } );
            if (eClass) this.createResource(uri, eClass);
        }

        this.$el.modal('hide');
    }

});



var PropertyWindow = Ecore.Edit.Window.extend({
    el: '#property-window',
    title: 'Property',
    draggable: true,
    content: new Ecore.Edit.PropertySheet(),
    render: function() {
        this.content.model = this.model;
        return Ecore.Edit.Window.prototype.render.apply(this);
    }
});



var EcoreDiagramEditor = Ecore.Edit.TabEditor.extend({
    tmpl: _.template('<div id="diagram-<%= id %>" style="width: 100%; height: 100%;"></div>'),

    initialize: function(attributes) {
        _.bindAll(this);
        this.title = this.getTitle() + '.diagram';
        Ecore.Edit.TabEditor.prototype.initialize.apply(this, [attributes]);

        this.diagram = new EcoreDiagram({ model: this.model.get('contents').first() });
    },
    renderContent: function() {
        if (!this.$diagram) {
            this.$diagram = $(this.tmpl({ id: this.cid }));
            this.$content.append(this.$diagram);
            this.diagram.setElement(this.$diagram[0]);
        }
    },
    show: function() {
        return Ecore.Edit.TabEditor.prototype.show.apply(this);
    }
});

var EcoreTreeEditor = Ecore.Edit.TreeTabEditor.extend({
    editElement: function() {
        Workbench.properties.model = this.tree.selected.model;
        Workbench.properties.render();
    }
});

var EcoreTabPanel = Ecore.Edit.TabPanel.extend({
    el: '#main',

    open: function(model, diagram) {
        var editor = this.find(model, diagram);
        if (!editor) {
            if (diagram)
                editor = new EcoreDiagramEditor({ model: model });
            else
                editor = new EcoreTreeEditor({ model: model });
            this.add(editor);
            editor.render();
        }
        editor.show();

        if (diagram) editor.diagram.render();
    },

    find: function(model, diagram) {
        return _.find(this.editors, function(editor) {
            if (editor.model === model) {
                if (diagram) {
                    return typeof editor.diagram === 'object';
                } else {
                    return typeof editor.diagram !== 'object';
                }
            }
            else return false;
        });
    },

    expand: function() {
        this.$el[0].style.left = '20px';
    }

});

//
// dnd
//

function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var startByte = e.target.getAttribute('data-startbyte');
    var endByte = e.target.getAttribute('data-endbyte');

    var files = e.dataTransfer.files;
    var file = files[0];
    var reader = new FileReader();

    reader.onloadend = function(e) {
        if (e.target.readyState == FileReader.DONE) {
            var data = e.target.result;
            var res = resourceSet.create({ uri: file.name  });
            res.parse(data, Ecore.XMI);
            resourceSet.trigger('change');
        }
    };

    var blob = file.slice(0, file.size);
    reader.readAsBinaryString(blob);
}

function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

var dropzone = $('#navigator')[0];
if (dropzone) {
    dropzone.addEventListener('dragover', handleDragOver, false);
    dropzone.addEventListener('drop', handleFileSelect, false);
}



window.onload = function() {

    window.Workbench = _.extend({}, Backbone.Events);

    // ResourceSet
    //

    var resourceSet = Ecore.ResourceSet.create();
    var EcoreResource = resourceSet.create({ uri: Ecore.EcorePackage.get('nsURI') });
    var ResourceResource = resourceSet.create({ uri: 'http://www.eclipselabs.org/ecore/2012/resources' });
    var SampleResource = resourceSet.create({ uri: 'sample.ecore' });
    var SamplePackage = Ecore.EPackage.create({
        name: 'sample', nsPrefix: 'sample', nsURI: 'http://example.org/sample',
        eClassifiers: [
            {   eClass: Ecore.EClass, name: 'Foo',
                eStructuralFeatures:[
                    { eClass: Ecore.EAttribute, name: 'bar', eType: Ecore.EString }
                ]
            }
        ]
    });
    SampleResource.get('contents').add(SamplePackage);

    Workbench.properties = new PropertyWindow();
    Workbench.editorTab = new EcoreTabPanel();
    Workbench.navigator = new NavigatorView({ model: resourceSet });
    Workbench.palette = Workbench.navigator.paletteView;

    Workbench.navigator.render();

    Workbench.navigator.on('open:editor', function(m) {
        this.editorTab.render().open(m);
    }, Workbench);

    Workbench.navigator.on('open:diagram', function(m) {
        this.editorTab.render().open(m, true);
    }, Workbench);

    Workbench.navigator.on('hide', function() {
        $('#main').animate({ left: '50px' }, 100);
    }, Workbench);

    Workbench.navigator.on('show', function() {
        $('#main').animate({ left: '300px' }, 100);
    }, Workbench);

    Workbench.editorTab.on('select', function(m) {
        this.properties.content.model = m;
    }, Workbench);

    Workbench.properties.content.on('change', function() {
        console.log(Workbench.editorTab);
    }, Workbench);

    resourceSet.on('add', function(m) {
        this.editorTab.render().open(m);
        this.properties.content.model = m;
        this.properties.render();
    }, Workbench);

};
