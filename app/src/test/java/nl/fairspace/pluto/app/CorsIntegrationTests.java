package nl.fairspace.pluto.app;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

@RunWith(SpringRunner.class)
@SpringBootTest
@WebAppConfiguration
public class CorsIntegrationTests {
	@Autowired
	private WebApplicationContext context;

	private MockMvc mockMvc;

	@Before
	public void setup() {
		mockMvc = MockMvcBuilders
				.webAppContextSetup(context)
				.apply(SecurityMockMvcConfigurers.springSecurity())
				.build();
	}

	@Test
	@WithMockUser(authorities = {"user-workspace"})
	public void corsHeadersAreSetProperly() throws Exception {
		MockHttpServletRequestBuilder request = options("/thehyve")
				.header("Origin", "http://fake-origin")
				.header("access-control-request-headers", "fake-header")
				.header("access-control-request-method", "PUT");

		// Expect no restrictions on origin, headers and methods and that credentials are allowed
		mockMvc
				.perform(request)
				.andExpect(header().string("Access-Control-Allow-Credentials", "true"))
				.andExpect(header().string("Access-Control-Allow-Origin", containsString("http://fake-origin")))
				.andExpect(header().string("Access-Control-Allow-Headers", containsString("fake-header")));
	}

}
