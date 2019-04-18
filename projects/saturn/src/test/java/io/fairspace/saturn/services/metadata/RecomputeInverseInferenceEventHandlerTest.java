package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.OWL;
import org.junit.Before;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class RecomputeInverseInferenceEventHandlerTest {
    RecomputeInverseInferenceEventHandler eventHandler;
    Dataset ds;

    private static final Node GRAPH = NodeFactory.createURI("http://graph");
    private static final Resource S1 = createResource("http://localhost/iri/Shape1");
    private static final Resource S2 = createResource("http://localhost/iri/Shape2");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");

    Statement OWL_INVERSE_STATEMENT = createStatement(P1, OWL.inverseOf, P2);

    @Before
    public void setUp() throws Exception {
        ds = DatasetFactory.createTxnMem();
        RDFConnection rdf = new RDFConnectionLocal(ds);
        eventHandler = new RecomputeInverseInferenceEventHandler(rdf, GRAPH);
    }

    @Test
    public void testRemovalOfExistingInverseTriples() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH.getURI()).add(OWL_INVERSE_STATEMENT));

        eventHandler.onEvent();

        assertFalse(ds.getNamedModel(GRAPH.getURI()).contains(OWL_INVERSE_STATEMENT));
    }

    @Test
    public void testInferringNewInverseStatements() {
        executeWrite(ds, () ->
                ds.getNamedModel(GRAPH.getURI())
                        .add(S1, SH.path, P1)
                        .add(S2, SH.path, P2)
                        .add(S1, FS.inverseRelation, S2)
        );

        eventHandler.onEvent();

        assertTrue(ds.getNamedModel(GRAPH.getURI()).contains(OWL_INVERSE_STATEMENT));

    }
}
