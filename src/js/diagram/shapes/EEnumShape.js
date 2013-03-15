
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

