
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

