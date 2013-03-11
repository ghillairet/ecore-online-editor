
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

