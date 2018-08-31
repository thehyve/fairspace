package io.fairspace.ceres

import com.github.tomakehurst.wiremock.client.WireMock.*
import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.jwk.JWK
import com.nimbusds.jose.jwk.KeyUse
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jwt.JWT
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.PlainJWT
import com.nimbusds.jwt.SignedJWT
import io.fairspace.ceres.repository.ModelRepository
import net.minidev.json.JSONObject
import org.apache.jena.query.Dataset
import org.apache.jena.rdf.model.ModelFactory
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.web.server.LocalServerPort
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock
import org.springframework.http.*
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.NoSuchAlgorithmException
import java.security.SecureRandom
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.*


@RunWith(SpringRunner::class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWireMock(port = 0)
@ActiveProfiles("test")
@DirtiesContext
class WebSecurityConfigurationTest {
    @LocalServerPort
    private val port: Int = 0

    @Autowired
    private val restTemplate: TestRestTemplate? = null

    @MockBean
    private val modelRepository: ModelRepository? = null

    @MockBean
    private val dataset: Dataset? = null

    private var publicKey: RSAPublicKey? = null
    private var privateKey: RSAPrivateKey? = null
    private val keyId = UUID.randomUUID().toString()
    private val random = SecureRandom()

    private val defaultExpiryDate = Date(Date().time + 60 * 1000)
    private val unsignedJWT = PlainJWT(getJwtClaimsSet(defaultExpiryDate))
    private val signedJWT: SignedJWT
            get() = getSignedJWT(defaultExpiryDate)

    @Before
    @Throws(Exception::class)
    fun setUp() {
        storeKeypair()
        val jwk = generateKeyset(keyId)
        serveKeyset(jwk)
    }

    @Test
    @Throws(JOSEException::class)
    fun testHealthEndpoint() {
        val response = restTemplate!!.getForEntity("http://localhost:${port}/actuator/health", String::class.java)
        assertEquals(HttpStatus.OK, response.statusCode)
    }


    @Test
    @Throws(JOSEException::class)
    fun testValidAccessToken() {
        `when`(modelRepository?.list(ArgumentMatchers.any(), ArgumentMatchers.any())).thenReturn(ModelFactory.createDefaultModel())
        val response = getWithKey(signedJWT)
        assertEquals(HttpStatus.OK, response.statusCode)
    }

    @Test
    fun testUnsignedAccessToken() {
        val response = getWithKey(unsignedJWT)
        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
    }

    @Test
    @Throws(JOSEException::class)
    fun testAccessTokenWithOtherKeyId() {
        val response = getWithKey(getSignedJWT(defaultExpiryDate, "test", privateKey))
        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
    }

    @Test
    @Throws(JOSEException::class)
    fun testExpiredSignedAccessToken() {
        val expiryDate = Date(Date().time - 60 * 1000)
        val response = getWithKey(getSignedJWT(expiryDate))
        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
    }


    private fun getWithKey(jwt: JWT, path: String = "/statements?subject=http%3A%2F%2Ffairspace.io"): ResponseEntity<String> {
        val headers = HttpHeaders()
        headers.set("Authorization", "Bearer " + jwt.serialize())

        val request = HttpEntity<Any>(headers)
        return restTemplate!!.exchange("http://localhost:${port}${path}", HttpMethod.GET, request, String::class.java)
    }

    @Throws(JOSEException::class)
    private fun getSignedJWT(expires: Date, keyId: String = this.keyId, privateKey: RSAPrivateKey? = this.privateKey): SignedJWT {
        // Create RSA-signer with the private key
        val signer = RSASSASigner(privateKey)

        val claimsSet = getJwtClaimsSet(expires)
        val header = JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(keyId)
                .build()

        val signedJWT = SignedJWT(header, claimsSet)

        // Compute the RSA signature
        signedJWT.sign(signer)

        return signedJWT
    }

    private fun getJwtClaimsSet(expires: Date): JWTClaimsSet {
        // Prepare JWT with claims set
        return JWTClaimsSet.Builder()
                .subject("alice")
                .issuer("https://test.com")
                .expirationTime(expires)
                .build()
    }

    @Throws(NoSuchAlgorithmException::class)
    private fun storeKeypair() {
        val keyPair = generateKeypair()

        // Store keys separately as RSA keys
        publicKey = keyPair.public as RSAPublicKey
        privateKey = keyPair.private as RSAPrivateKey
    }

    @Throws(NoSuchAlgorithmException::class)
    private fun generateKeypair(): KeyPair {
        val generator = KeyPairGenerator.getInstance("RSA")
        generator.initialize(1024, random)
        return generator.generateKeyPair()
    }

    private fun generateKeyset(keyId: String): JWK {
        return RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(keyId)
                .keyUse(KeyUse.SIGNATURE)
                .build()
    }

    private fun serveKeyset(jwk: JWK) {
        val jsonKeySet = JSONObject(Collections.singletonMap("keys", listOf(jwk.toJSONObject())))

        // Setup wiremock endpoint to return keyset
        stubFor(get(urlEqualTo("/certs"))
                .willReturn(aResponse().withHeader("Content-Type", "application/json").withBody(jsonKeySet.toJSONString())))
    }


}