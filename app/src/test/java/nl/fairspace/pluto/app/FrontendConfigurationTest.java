package nl.fairspace.pluto.app;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
@ActiveProfiles("noAuth")
public class FrontendConfigurationTest {
	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;

	@Test
	public void frontendConfigurationReturnsAllUrlsSpecified() throws Exception {
		Map config = restTemplate.getForObject("http://localhost:" + port + "/api/workspace/config", Map.class);

		assertTrue(config.containsKey("urls"));
		assertEquals("https://jupyterhub.someplace", ((Map) config.get("urls")).get("jupyter"));
		assertEquals("https://external-url", ((Map) config.get("urls")).get("cbioportal"));
	}

}
