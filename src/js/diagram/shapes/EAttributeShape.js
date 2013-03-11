
var EAttributeShape = Ds.Label.extend({
    resizable: false,
    draggable: false,
    selectable: false,

    figure: {
        type: 'text',
        text: 'name: EString',
        height: 20,
        width: 100,
        stroke: 'blue',
        position: 'left'
    },

    gridData: {
        horizontalAlignment: 'beginning',
        verticalAlignment: 'center',
        grabExcessHorizontalSpace: true
    },

    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
        }

        var text = this.model.get('name') + ' : ' + this.model.get('eType').get('name');
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

var EAttributeCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 20,
        width: 100,
        fill: '235-#F9F9D8-#FFFFFF',
        'fill-opacity': 1,
        stroke: '#D8D8D1',
        'stroke-width': 2
    },

    layout: {
        type: 'grid',
        marginHeight: 0,
        marginWidth: 0,
        columns: 1
    },

    gridData: {
        horizontalAlignment: 'fill',
        verticalAlignment: 'fill',
        grabExcessHorizontalSpace: true
    },

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

