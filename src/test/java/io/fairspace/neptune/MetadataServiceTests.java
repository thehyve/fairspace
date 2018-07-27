package io.fairspace.neptune;


import io.fairspace.neptune.service.*;
import io.fairspace.neptune.model.PredicateInfo;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Collections;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MetadataServiceTests {
    private static final String SUBJECT_URI = "http://example.com/Subject";
    private static final String PREDICATE_URI = "http://example.com/predicate";
    private static final String PREDICATE_LABEL = "label";


    @MockBean
    TripleService tripleService;

    @MockBean
    PredicateService predicateService;

    @Autowired
    MetadataService metadataService;

    @Test
    public void retrieveMetadataTest() {

        when(tripleService.retrieveTriples(SUBJECT_URI)).thenReturn(createTriples());
        when(predicateService.retrievePredicateInfos(Collections.singleton(PREDICATE_URI)))
                .thenReturn(Collections.singletonList(new PredicateInfo(PREDICATE_URI, PREDICATE_LABEL)));
        Model combi = metadataService.retrieveMetadata(SUBJECT_URI);


        assertTrue(combi.contains(combi.createResource(SUBJECT_URI), combi.createProperty(PREDICATE_URI)));
        assertTrue(combi.contains(combi.createResource(PREDICATE_URI), RDF.type, RDF.Property));
        assertTrue(combi.contains(combi.createResource(PREDICATE_URI), RDFS.label, combi.createProperty(PREDICATE_LABEL)));
    }

    private Model createTriples() {
        Model m = createDefaultModel();
        m.add(m.createResource(SUBJECT_URI), m.createProperty(PREDICATE_LABEL), "test");
        return m;
    }
}
