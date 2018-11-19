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

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWireMock(port = 8531)
@DirtiesContext
public class AccountResourceTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private RSAPublicKey publicKey;
    private RSAPrivateKey privateKey;
    private String keyId = UUID.randomUUID().toString();
    private SecureRandom random = new SecureRandom();

    @Before
    public void setup() throws NoSuchAlgorithmException {
        storeKeypair();
        JWK jwk = generateKeyset(keyId);
        serveKeyset(jwk);
    }

    @Test
    public void exchangeTokensAllowsForConsecutiveRequests() throws Exception {
        JWT accessToken = new JWTBuilder().signWith(keyId, privateKey).authorities(Collections.singletonList("user-workspace")).build();
        JWT refreshToken = new JWTBuilder().signWith(keyId, privateKey).build();

        // Create request for the exchange-token endpoint
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ExchangeTokenParams exchangeTokenParams = new ExchangeTokenParams(accessToken.serialize(), refreshToken.serialize());
        HttpEntity<ExchangeTokenParams> request = new HttpEntity<>(exchangeTokenParams, headers);

        ResponseEntity<Map> tokenData = restTemplate.exchange("http://localhost:" + port + "/account/tokens", HttpMethod.POST, request, Map.class);
        assertEquals(200, tokenData.getStatusCodeValue());

        // Ensure that the session id is returned both as a cookie and explicitly
        String cookieHeader = tokenData.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        String cookieNameAndValue = cookieHeader.split(";")[0];

        String cookieName = "JSESSIONID";
        assertEquals(cookieNameAndValue, cookieName + "=" + tokenData.getBody().get("sessionId"));

        // Ensure we can use the cookie to make new calls
        headers = new HttpHeaders();
        headers.add("Cookie", cookieNameAndValue);

        HttpEntity<Object> consecutiveRequest = new HttpEntity<>(headers);
        ResponseEntity<String> secondCall = restTemplate.exchange("http://localhost:" + port + "/thehyve", HttpMethod.GET, consecutiveRequest, String.class);

        assertEquals(200, secondCall.getStatusCodeValue());
    }

    private void storeKeypair() throws NoSuchAlgorithmException {
        KeyPair keyPair = generateKeypair();

        // Store keys separately as RSA keys
        publicKey = (RSAPublicKey) keyPair.getPublic();
        privateKey = (RSAPrivateKey) keyPair.getPrivate();
    }

    private KeyPair generateKeypair() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048, random);
        return generator.generateKeyPair();
    }

    private JWK generateKeyset(String keyId) {
        return new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(keyId)
                .keyUse(KeyUse.SIGNATURE)
                .build();
    }

    private void serveKeyset(JWK jwk) {
        JSONObject jsonKeySet = new JSONObject(Collections.singletonMap("keys", Collections.singletonList(jwk.toJSONObject())));

        // Setup wiremock endpoint to return keyset
        stubFor(get(urlEqualTo("/certs"))
                .willReturn(aResponse().withHeader("Content-Type", "application/json").withBody(jsonKeySet.toJSONString())));
    }

}
