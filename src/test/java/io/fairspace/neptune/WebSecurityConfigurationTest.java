package io.fairspace.neptune;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.PlainJWT;
import com.nimbusds.jwt.SignedJWT;
import net.minidev.json.JSONObject;
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
import org.springframework.http.HttpStatus;
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
import java.util.Date;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWireMock(port = 0)
@ActiveProfiles("test")
@DirtiesContext
public class WebSecurityConfigurationTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private RSAPublicKey publicKey;
    private RSAPrivateKey privateKey;
    private String keyId = UUID.randomUUID().toString();
    private SecureRandom random = new SecureRandom();

    @Before
    public void setUp() throws Exception {
        storeKeypair();
        JWK jwk = generateKeyset(keyId);
        serveKeyset(jwk);

        serveCeres();
    }

    @Test
    public void testValidAccessToken() throws JOSEException {
        ResponseEntity<String> response = getWithKey(getSignedJWT());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    public void testUnsignedAccessToken() {
        ResponseEntity<String> response = getWithKey(getUnsignedJWT());
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    public void testAccessTokenWithOtherKeyId() throws JOSEException {
        ResponseEntity<String> response = getWithKey(getSignedJWT(getDefaultExpiryDate(), "test", privateKey));
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    public void testExpiredSignedAccessToken() throws JOSEException {
        Date expiryDate = new Date(new Date().getTime() - 60 * 1000);
        ResponseEntity<String> response = getWithKey(getSignedJWT(expiryDate));
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }


    private ResponseEntity<String> getWithKey(JWT jwt) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwt.serialize());

        HttpEntity<Object> request = new HttpEntity<>(headers);
        return restTemplate.exchange("http://localhost:" + port + "/metadata?uri=http%3A%2F%2Ffairspace.com", HttpMethod.GET, request, String.class);
    }

    private SignedJWT getSignedJWT() throws JOSEException {
        return getSignedJWT(getDefaultExpiryDate());
    }

    private SignedJWT getSignedJWT(Date expires) throws JOSEException {
        return getSignedJWT(expires, keyId, privateKey);
    }

    private SignedJWT getSignedJWT(Date expires, String keyId, RSAPrivateKey privateKey) throws JOSEException {
        // Create RSA-signer with the private key
        JWSSigner signer = new RSASSASigner(privateKey);

        JWTClaimsSet claimsSet = getJwtClaimsSet(expires);
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(keyId)
                .build();


        SignedJWT signedJWT = new SignedJWT(header, claimsSet);

        // Compute the RSA signature
        signedJWT.sign(signer);

        return signedJWT;
    }

    private PlainJWT getUnsignedJWT() {
        JWTClaimsSet claimsSet = getJwtClaimsSet(getDefaultExpiryDate());
        return new PlainJWT(claimsSet);
    }

    private JWTClaimsSet getJwtClaimsSet(Date expires) {
        // Prepare JWT with claims set
        return new JWTClaimsSet.Builder()
                .subject("alice")
                .issuer("https://test.com")
                .expirationTime(expires)
                .build();
    }

    private void storeKeypair() throws NoSuchAlgorithmException {
        KeyPair keyPair = generateKeypair();

        // Store keys separately as RSA keys
        publicKey = (RSAPublicKey) keyPair.getPublic();
        privateKey = (RSAPrivateKey) keyPair.getPrivate();
    }

    private KeyPair generateKeypair() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(1024, random);
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

    private void serveCeres() {
        // Setup wiremock endpoint to return keyset
        stubFor(get(urlPathEqualTo("/ceres/model/default/statements/"))
                .willReturn(
                        aResponse()
                                .withHeader("Content-Type", "application/ld+json")
                                .withBody("{\n" +
                                        "  \"@context\": \"http://schema.org\",\n" +
                                        "  \"@type\": \"Book\",\n" +
                                        "  \"name\": \"Semantic Web Primer (First Edition)\",\n" +
                                        "  \"publisher\": \"Linked Data Tools\",\n" +
                                        "  \"inLanguage\": \"English\"}")));
    }


    private Date getDefaultExpiryDate() {
        return new Date(new Date().getTime() + 60 * 1000);
    }



}
