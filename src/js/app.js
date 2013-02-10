
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

