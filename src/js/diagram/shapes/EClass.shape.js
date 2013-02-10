
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

