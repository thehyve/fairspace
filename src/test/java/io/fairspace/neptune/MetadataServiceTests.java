package io.fairspace.neptune;


import io.fairspace.neptune.model.ObjectType;
import io.fairspace.neptune.service.*;
import io.fairspace.neptune.model.PredicateInfo;
import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.model.TripleObject;
import io.fairspace.neptune.web.CombinedTriplesWithPredicateInfo;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MetadataServiceTests {

    @MockBean
    TripleService tripleService;

    @MockBean
    PredicateService predicateService;

    @Autowired
    MetadataService metadataService;

    @Test
    public void retrieveMetadataTest() {
        URI uri = URI.create("http://schema.org/Author");
        URI predicateUri = URI.create("http://www.schema.org/Person");
        when(tripleService.retrieveTriples(uri)).thenReturn(createTriples());
        when(predicateService.retrievePredicateInfos(Collections.singleton(predicateUri)))
                .thenReturn(Collections.singletonList(createPredicate()));
        CombinedTriplesWithPredicateInfo combi = metadataService.retrieveMetadata(uri);
        Assert.assertEquals(new CombinedTriplesWithPredicateInfo(createTriples(),
                Collections.singletonList(createPredicate())), combi);
    }

    private List<Triple> createTriples() {
        URI uri = URI.create("http://schema.org/Author");
        TripleObject tripleObject = new TripleObject(ObjectType.literal, "1", "en", uri);
        URI uriPredicate = URI.create("http://www.schema.org/Person");
        return Arrays.asList(new Triple("http://test", uriPredicate, tripleObject), new Triple("test1", uriPredicate, tripleObject));
    }

    private PredicateInfo createPredicate() {
        URI uri = URI.create("http://schema.org/Person");
        PredicateInfo predicateInfo = new PredicateInfo();
        predicateInfo.setUri(uri);
        predicateInfo.setLabel("Person");
        return predicateInfo;
    }

}
