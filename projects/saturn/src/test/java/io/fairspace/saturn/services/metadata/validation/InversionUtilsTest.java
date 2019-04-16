package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.Vocabularies;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;

import java.util.Set;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertEquals;

public class InversionUtilsTest {
    private static final Resource R1 = createResource("http://example.com/resource1");
    private static final Resource R2 = createResource();
    private static final Resource R3 = createResource("http://example.com/resource2");
    private static final Property P1 = createProperty("http://example.com/property");
    private static final Property P2 = createProperty("http://fairspace.io/ontology#derivesFrom"); // has an inverse

    private RDFConnection rdf = new RDFConnectionLocal(DatasetFactory.create());

    @Before
    public void setUp() {
        new Vocabularies(rdf);
    }

    @Test
    public void testNoInversion() {
        // Because P1 does not have an inverse, R3 should not be included in the affected resources
        var changes = createDefaultModel().add(R1, P1, R3).add(R2, P1, R3);
        assertEquals(Set.of(R1, R2), InversionUtils.getAffectedResources(rdf, changes));
    }

    @Test
    public void testWithInversion() {
        // Because P2 does have an inverse, R3 should be included in the affected resources
        var changes = createDefaultModel().add(R1, P2, R3);
        assertEquals(Set.of(R1, R3), InversionUtils.getAffectedResources(rdf, changes));
    }
}
