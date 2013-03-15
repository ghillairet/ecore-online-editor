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

