package nl.fairspace.pluto.app.web;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWT;
import net.minidev.json.JSONObject;
import nl.fairspace.pluto.app.JWTBuilder;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
@ActiveProfiles("noAuth")
public class WorkspaceResourceTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void frontendConfigurationReturnsAllUrlsSpecified() throws Exception {
        Map config = restTemplate.getForObject("http://localhost:" + port + "/api/v1/workspace/config", Map.class);

        assertTrue(config.containsKey("urls"));
        assertEquals("https://jupyterhub.someplace", ((Map) config.get("urls")).get("jupyter"));
        assertEquals("https://external-url", ((Map) config.get("urls")).get("cbioportal"));
    }

    @Test
    public void workspaceDetailsReturnsNameAndVersion() throws Exception {
        Map details = restTemplate.getForObject("http://localhost:" + port + "/api/v1/workspace/details", Map.class);

        assertEquals("Test Workspace", details.get("name"));
        assertEquals("1.2.3-TEST", details.get("version"));
    }

}
