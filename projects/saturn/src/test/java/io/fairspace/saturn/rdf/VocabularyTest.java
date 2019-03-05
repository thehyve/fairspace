package io.fairspace.saturn.rdf;

import org.apache.commons.collections.IteratorUtils;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class VocabularyTest {
    private static final String baseURI = "http://example.com/";
    private static final Resource resource1 = createResource("http://property1");
    private static final Resource resource2 = createResource("http://property2");
    private static final Resource resource3 = createResource("http://property3");
    private static final Resource unknownResource= createResource("http://unknownResource");
    private static final Property machineOnly = createProperty("http://fairspace.io/ontology#machineOnly");

    private Vocabulary vocabulary;
    private Model vocabularyModel;

    @Before
    public void setUp() {
        setWorkspaceURI(baseURI); // TODO: Remove this global variable
        Dataset dataset = createTxnMem();
        RDFConnectionLocal rdf = new RDFConnectionLocal(dataset);

        Node vocabularyUri = createURI(baseURI + "vocabulary");
        vocabularyModel = dataset.getNamedModel(vocabularyUri.getURI());

        // Create object under test
        vocabulary = new Vocabulary(rdf, vocabularyUri);
    }


    @Test
    public void testGetMachineOnlyPredicates() {
        setupVocabularyWithMachineOnlyPredicates();

        // Test method
        Model machineOnlyPredicates = vocabulary.getMachineOnlyPredicates();

        // Verify outcome
        List list = IteratorUtils.toList(machineOnlyPredicates.listSubjects());
        assertEquals(1, list.size());
        assertTrue(list.contains(resource2));
    }

    @Test
    public void testIsMachineOnlyPredicate() {
        setupVocabularyWithMachineOnlyPredicates();

        assertFalse(vocabulary.isMachineOnlyPredicate(resource1.getURI()));
        assertTrue(vocabulary.isMachineOnlyPredicate(resource2.getURI()));
        assertFalse(vocabulary.isMachineOnlyPredicate(resource3.getURI()));
        assertFalse(vocabulary.isMachineOnlyPredicate(unknownResource.getURI()));

        // Also return false if null is given, as we do not recognize it as machine only
        assertFalse(vocabulary.isMachineOnlyPredicate(null));
    }

    private Resource setupVocabularyWithMachineOnlyPredicates() {
        // Setup model
        vocabularyModel.add(resource1, RDF.type, RDF.Property);
        vocabularyModel.add(resource2, RDF.type, RDF.Property);
        vocabularyModel.add(resource3, RDF.type, RDF.Property);

        vocabularyModel.add(resource1, machineOnly, createTypedLiteral(false));
        vocabularyModel.add(resource2, machineOnly, createTypedLiteral(true));
        return resource2;
    }

}
