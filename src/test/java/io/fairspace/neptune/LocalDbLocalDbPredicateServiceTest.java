package io.fairspace.neptune;

import io.fairspace.neptune.predicate.db.LocalDbPredicate;
import io.fairspace.neptune.predicate.db.LocalDbPredicateService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class LocalDbLocalDbPredicateServiceTest {

    @MockBean
    private LocalDbPredicateService localDbPredicateService;

    @Test
    public void insertPredicateTest() {
        URI uri =  URI.create("http://schema.org/Author");
        List<URI> alternatives = new ArrayList<>();
        alternatives.add(uri);
        LocalDbPredicate localDbPredicate = new LocalDbPredicate("Author", uri, alternatives);
        localDbPredicateService.insertPredicate(localDbPredicate);
    }

}
