package nl.fairspace.pluto.app;

import org.apache.http.client.HttpClient;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.resource.UserRedirectRequiredException;
import org.springframework.security.oauth2.provider.token.AuthorizationServerTokenServices;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@WebAppConfiguration
public class OAuth2IntegrationTests {
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
	public void contextLoads() {
	}

	@Test
	public void applicationRequiesAuthentication() throws Exception {
		mockMvc
				.perform(get("/thehyve"))
				.andExpect(status().is4xxClientError());
	}


	@Test
	public void applicationRedirectsWhenHtmlIsAccepted() throws Exception {
		mockMvc
				.perform(get("/thehyve").accept(MediaType.TEXT_HTML))
				.andExpect(status().is3xxRedirection())
				.andExpect(header().string("Location", endsWith("/login")));
	}

	@Test
	public void applicationRedirectsWhenHtmlAndJsonIsAccepted() throws Exception {
		mockMvc
				.perform(get("/thehyve").accept(MediaType.TEXT_HTML, MediaType.APPLICATION_JSON))
				.andExpect(status().is3xxRedirection());
	}

	@Test
	public void applicationProvides401WithAjaxHeader() throws Exception {
		mockMvc
				.perform(get("/thehyve").header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().is4xxClientError());
	}

	@Test
	public void applicationProvides401WithOnlyJsonAccepted() throws Exception {
		mockMvc
				.perform(get("/thehyve").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().is4xxClientError());
	}

	@Test
	public void applicationProvidesLoginPathInHeader() throws Exception {
		mockMvc
				.perform(get("/thehyve").accept(MediaType.APPLICATION_JSON))
				.andExpect(header().string("X-Login-Path", endsWith("/login")));
	}


	@Test
	@WithMockUser(authorities = {"user-workspace"})
	public void accessAllowedAfterLoginAndWithProperAuthorities() throws Exception {
		mockMvc
				.perform(get("/thehyve"))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	@WithMockUser
	public void accessNotAllowedWithoutCorrectAuthority() throws Exception {
		mockMvc
				.perform(get("/thehyve"))
				.andExpect(status().isForbidden());
	}

	@Test
	@WithMockUser
	public void accessAllowedWithoutCorrectAuthorityToNoAuthzEndpoint() throws Exception {
		mockMvc
				.perform(get("/noauthz"))
				.andExpect(status().is2xxSuccessful());
	}

	@Test(expected = UserRedirectRequiredException.class)
	public void loginRedirectsToOauthServer() throws Exception {
		mockMvc.perform(get("/login"));
	}

	@Test
	public void healthEndpointIsAvailableWithoutAuthentication() throws Exception {
		mockMvc
				.perform(get("/actuator/health"))
				.andExpect(status().is2xxSuccessful());
	}
}
