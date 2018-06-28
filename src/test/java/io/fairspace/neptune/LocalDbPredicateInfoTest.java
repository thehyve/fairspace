package io.fairspace.neptune;

import io.fairspace.neptune.predicate.db.LocalDbPredicateInfo;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@RunWith(MockitoJUnitRunner.class)
public class LocalDbPredicateInfoTest {

    @Test
    public void createLocalDbPredicateWithAlternativesTest() {
        URI uri = URI.create("http://schema.org/Author");
        List<URI> alternatives = new ArrayList<>();
        alternatives.add(URI.create("htpp://schema.org/Creator"));
        alternatives.add(URI.create("http://www.w3.org/ns/dcat#creator"));
        LocalDbPredicateInfo localDbPredicateInfo = new LocalDbPredicateInfo("Author", uri, alternatives);
        Assert.assertSame(localDbPredicateInfo.getClass(), LocalDbPredicateInfo.class);
    }

}
