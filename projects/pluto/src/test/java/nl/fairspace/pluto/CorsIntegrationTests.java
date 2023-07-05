package nl.fairspace.pluto;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
@ActiveProfiles("noAuth")
public class CorsIntegrationTests {
	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;

	@Before
	public void setup() {
	}

	@Test
	public void corsHeadersAreSetProperly() throws Exception {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Origin", "http://fake-origin");
		headers.set("access-control-request-headers", "fake-header");
		headers.set("access-control-request-method", "PUT");

		HttpEntity<Object> request = new HttpEntity<>(headers);
		ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + port + "/thehyve", HttpMethod.OPTIONS, request, String.class);

		// Expect no restrictions on origin, headers and methods and that credentials are allowed
		assertEquals(200, response.getStatusCodeValue());
		assertEquals("true", response.getHeaders().get("Access-Control-Allow-Credentials").get(0));
		assertEquals("http://fake-origin", response.getHeaders().get("Access-Control-Allow-Origin").get(0));
		assertEquals("fake-header", response.getHeaders().get("Access-Control-Allow-Headers").get(0));
		assertEquals("PUT", response.getHeaders().get("Access-Control-Allow-Methods").get(0));
	}

	@Test
	public void corsIsAllowedForAllConfiguredDomains() throws Exception {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Origin", "http://other-origin");
		headers.set("access-control-request-headers", "fake-header");
		headers.set("access-control-request-method", "PUT");

		HttpEntity<Object> request = new HttpEntity<>(headers);
		ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + port + "/thehyve", HttpMethod.OPTIONS, request, String.class);

		// Expect no restrictions on origin, headers and methods and that credentials are allowed
		assertEquals(200, response.getStatusCodeValue());
		assertEquals("http://other-origin", response.getHeaders().get("Access-Control-Allow-Origin").get(0));
	}

	@Test
	public void corsHeadersForWebdavRequestMethod() throws Exception {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Origin", "http://fake-origin");
		headers.set("access-control-request-headers", "depth");
		headers.set("access-control-request-method", "PROPFIND");

		HttpEntity<Object> request = new HttpEntity<>(headers);
		ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + port + "/thehyve", HttpMethod.OPTIONS, request, String.class);

		// Expect no restrictions on origin, headers and methods and that credentials are allowed
		assertEquals(200, response.getStatusCodeValue());
		assertEquals("true", response.getHeaders().get("Access-Control-Allow-Credentials").get(0));
		assertEquals("http://fake-origin", response.getHeaders().get("Access-Control-Allow-Origin").get(0));
		assertEquals("depth", response.getHeaders().get("Access-Control-Allow-Headers").get(0));
		assertEquals("PROPFIND", response.getHeaders().get("Access-Control-Allow-Methods").get(0));
	}

}
