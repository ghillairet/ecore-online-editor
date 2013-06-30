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

