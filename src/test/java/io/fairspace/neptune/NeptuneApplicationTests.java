package io.fairspace.neptune;

import io.fairspace.neptune.metadata.ceres.CeresService;
import io.fairspace.neptune.predicate.db.LocalDbPredicateService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class NeptuneApplicationTests {

	@MockBean
	CeresService ceresService;

	@MockBean
	LocalDbPredicateService localDbPredicateService;

	@Test
	public void contextLoads() {
	}

}
