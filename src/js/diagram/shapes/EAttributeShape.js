
var EAttributeShape = DG.Label.extend({

    initialize: function(attributes) {
        var attrs = attributes || {};

        if (attrs.model) {
            this.model = attrs.model;
        } else {
            this.model = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
        }

        var text = this.model.get('name');
        if (this.model.has('eType')) text += ': ' + this.model.get('eType').get('name');

        this.attributes.text = text;
/*
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
*/
    },

    createFigure: function() {
        return DG.Figure.create(this, {
            type: 'text',
            text: 'name: String',
            stroke: 'none',
            fill: '#535353'
        });
    }
});

