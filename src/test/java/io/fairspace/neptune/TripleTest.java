package io.fairspace.neptune;

import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleObject;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URI;

@RunWith(MockitoJUnitRunner.class)
public class TripleTest {

    @Test
    public void createTripleTest() {
        URI uri = URI.create("http://schema.org/Author");
        TripleObject tripleObject = new TripleObject(
                "Literal", "1", "en", uri);
        URI uriPredicate = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral");
        Triple triple = new Triple("test", uriPredicate, tripleObject);
        Assert.assertSame(triple.getClass(), Triple.class);
    }

}
