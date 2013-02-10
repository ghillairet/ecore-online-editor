
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
