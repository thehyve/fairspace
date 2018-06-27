package io.fairspace.neptune;

import io.fairspace.neptune.business.PredicateInfo;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.net.URI;

@RunWith(MockitoJUnitRunner.class)
public class PredicateInfoTest {

    @Test
    public void createLocalDbPredicateTest() {
        URI uri = URI.create("http://schema.org/Author");
        PredicateInfo predicateInfo = new PredicateInfo("Author", uri);
        Assert.assertSame(predicateInfo.getClass(), PredicateInfo.class);
    }


}
