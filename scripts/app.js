jQuery(function() {

    window.Demo = {};

    var Workbench = Demo.Workbench = _.extend({}, Backbone.Events);




var EAttributeShape = Ds.Label.extend({
    resizable: false,
    draggable: false,

    figure: {
        type: 'text',
        text: 'name: EString',
        height: 20,
        stroke: 'blue',
        position: 'center-left'
    },

    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
        }

        var text = this.model.get('name') + ' : ' + this.model.get('eType').get('name');
        this.setText(text);
    }
});

var EAttributeCompartment = {
    compartment: true,

    figure: {
        type: 'rect',
        height: 20,
        fill: 'none',
        stroke: '#D8D8D1',
        'stroke-width': 2
    },

    layout: {
        type: 'flex',
        columns: 1,
        stretch: false
    },

    accepts: [ EAttributeShape ]
};



var EOperationShape = Ds.Label.extend({
    resizable: false,
    draggable: false,

    figure: {
        type: 'text',
        text: 'op(): EString',
        height: 20,
        stroke: 'blue',
        position: 'center-left'
    }
});

var EOperationCompartment = {
    compartment: true,

    figure: {
        type: 'rect',
        height: 20,
        fill: 'none',
        stroke: 'none',
        'stroke-width': 2
    },

    layout: {
        type: 'flex',
        columns: 1,
        stretch: false
    },

    accepts: [ EOperationShape ]
};



var EClassLabel = {
    figure: {
        type: 'text',
        text: 'EClass',
        height: 30,
        'font-size': 14
    }
};

var EClassShape = Ds.Shape.extend({
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
        type: 'flex',
        columns: 1,
        stretch: true
    },

    children: [
        EClassLabel,
        EAttributeCompartment,
        EOperationCompartment
    ],

    initialize: function(attributes) {
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
    },

    createContent: function() {
        var compartment = this.children[1];
//        _.each(this.model.get('eAttributes'), function(a) {
//            var shape = this.diagram.createShape(EAttributeShape, { model: a });
//            compartment.add(shape);
//        }, this);
    }

});



var current = { x: 0, y: 100 };
function layout() {
    var ws = 200, we = 1200,
        pad = 250;

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
    el: 'diagram',

    children: [
        EClassShape
    ],

    initialize: function(attributes) {
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
    },

    createContent: function() {
        this.model.get('eClassifiers').each(function(c) {
            if (c.isTypeOf('EClass')) {
                var position = layout();
                this.createShape(EClassShape, { model: c, x: position.x, y: position.y });
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
        console.log(this.model);
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
    content: new Ecore.Edit.PropertySheet()
});



var EcoreTabPanel = Ecore.Edit.TabPanel.extend({
    el: '#main',

    open: function(model, diagram) {
        var editor = this.getByModel(model);
        if (!editor) {
            editor = new Ecore.Edit.TreeTabEdior({ model: model });
            this.add(editor);
            editor.render();
        }
        editor.show();
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

//Workbench.editorTab.render().open(EcoreResource);
Workbench.navigator.render();

Workbench.navigator.on('open:editor', function(m) {
    this.editorTab.render().open(m);
}, Workbench);

Workbench.navigator.on('open:diagram', function(m) {
    this.editorTab.render().open(m, true);
}, Workbench);

Workbench.navigator.on('hide', function() {
    $('.part').animate({ left: '30px' }, 100);
}, Workbench);

Workbench.navigator.on('show', function() {
    $('.part').animate({ left: '280px' }, 100);
}, Workbench);

Workbench.editorTab.on('select', function(m) {
    this.properties.content.model = m;
}, Workbench);

resourceSet.on('add', function(m) {
    this.editorTab.render().open(m);
    this.properties.content.model = m;
    this.properties.render();
}, Workbench);



});

