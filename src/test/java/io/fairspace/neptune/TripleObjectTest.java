package io.fairspace.neptune;

import io.fairspace.neptune.business.TripleObject;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URI;

@RunWith(MockitoJUnitRunner.class)
public class TripleObjectTest {

    @Test
    public void createTripleObjectTest() {
        URI uri = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral");
        TripleObject tripleObject = new TripleObject(
                "Literal", "1", "en", uri);
        Assert.assertSame(tripleObject.getClass(), TripleObject.class);
    }

}
