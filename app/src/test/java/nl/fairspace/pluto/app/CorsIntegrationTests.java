package nl.fairspace.pluto.app;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

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
	}

}
