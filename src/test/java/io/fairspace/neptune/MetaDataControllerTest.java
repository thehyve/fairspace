package io.fairspace.neptune;

import io.fairspace.neptune.business.MetadataService;
import io.fairspace.neptune.business.PredicateInfo;
import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleObject;
import io.fairspace.neptune.metadata.ceres.CeresService;
import io.fairspace.neptune.predicate.db.LocalDbPredicate;
import io.fairspace.neptune.predicate.db.LocalDbPredicateService;
import io.fairspace.neptune.web.CombinedTriplesWithPredicateInfo;
import io.fairspace.neptune.web.MetadataController;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.internal.bytebuddy.matcher.ElementMatchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(MetadataController.class)
public class MetaDataControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    CeresService ceresService;

    @MockBean
    LocalDbPredicateService localDbPredicateService;

    @MockBean
    MetadataService metadataService;

    @Test
    public void retrievecombinedMetadataWithPredicateInfoTest() throws Exception {
        URI uri = URI.create("http://schema.org/Author");
        URI uri2 = URI.create("http%3A%2F%2Fschema.org%2FAuthor");
        TripleObject tripleObject = new TripleObject(
                "Literal", "1", "en", uri);
        URI uriPredicate = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral");
        Triple triple = new Triple("test", uriPredicate, tripleObject);
        when(metadataService.retrievMetadata(uri2)).thenReturn(new CombinedTriplesWithPredicateInfo(createTriples(), createPredicate()));
        mvc.perform(get("/metadata/retrieve?uri=http%3A%2F%2Fschema.org%2FAuthor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.triples[0].subject", is(uri2.toString())).exists())
                .andExpect(jsonPath("$.predicateInfo[0].label", is("Author")).exists());
    }

    private List<Triple> createTriples() {
        URI uri = URI.create("http://schema.org/Author");
        TripleObject tripleObject = new TripleObject(
                "Literal", "1", "en", uri);
        URI uriPredicate = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral");
        return new ArrayList<>(Arrays.asList(new Triple("test", uriPredicate, tripleObject), new Triple("test1", uriPredicate, tripleObject)));
    }

    private List<PredicateInfo> createPredicate() {
        URI uri = URI.create("http://schema.org/Author");
        List<URI> alternatives = new ArrayList<>();
        alternatives.add(URI.create("htpp://schema.org/Creator"));
        alternatives.add(URI.create("http://www.w3.org/ns/dcat#creator"));
        return Collections.singletonList(new LocalDbPredicate("Author", uri, alternatives));
    }

}
