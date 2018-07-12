package io.fairspace.ceres


import com.auth0.jwk.Jwk
import com.auth0.jwk.JwkProvider
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import io.ktor.config.MapApplicationConfig
import io.ktor.http.*
import io.ktor.server.testing.*
import org.koin.dsl.module.Module
import org.koin.dsl.module.applicationContext
import java.security.KeyPairGenerator
import java.security.SecureRandom
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.*
import java.util.concurrent.TimeUnit
import kotlin.test.Test
import kotlin.test.assertEquals


class AuthenticationTest: BaseCeresTest() {
    private val keyPair =
            KeyPairGenerator.getInstance("RSA").apply { initialize(2048, SecureRandom()) }.generateKeyPair()
    private val algorithm = Algorithm.RSA256(keyPair.public as RSAPublicKey, keyPair.private as RSAPrivateKey)
    private val issuer = "https://jwt-provider-domain/"
    private val audience = "jwt-audience"
    private val keyId = "NkJCQzIyQzRBMEU4NjhGNUU4MzU4RkY0M0ZDQzkwOUQ0Q0VGNUMwQg"
    private val YESTERDAY = Date(Date().time - TimeUnit.DAYS.toMillis(1))
    private val TOMORROW = Date(Date().time + TimeUnit.DAYS.toMillis(1))


    @Test
    fun `The hello page should work without JWT`() = test {
        with(handleRequest(HttpMethod.Get, "/")) {
            assertEquals(HttpStatusCode.OK, response.status())
        }
    }

    @Test
    fun `Requests with a valid JWT should succeed`() =
            expectSuccess(createToken())

    @Test
    fun `Requests without a JWT should fail`() =
            expectFail("")

    @Test
    fun `Requests with a wrong scheme should fail`() =
        expectFail(createToken(prefix = "Bear "))

    @Test
    fun `Requests with a wrong issuer should fail`() =
        expectFail(createToken(issuer = "wrong"))

    @Test
    fun `Requests with a wrong keyId should fail`() =
        expectFail(createToken(keyId = "wrong"))

    @Test
    fun `Requests with an expired token should fail`() =
        expectFail(createToken(expiresAt = YESTERDAY))




    private fun expectSuccess(token: String) = expectStatus(token, HttpStatusCode.OK)

    private fun expectFail(token: String) = expectStatus(token, HttpStatusCode.Unauthorized)

    private fun expectStatus(token: String, status: HttpStatusCode) =
        test {
            with(handleRequest {
                uri = "/model/m1/statements"
                addHeader(HttpHeaders.Authorization, token) }) {
                assertEquals(status, status)
            }
        }

    private fun <R> test(block: TestApplicationEngine.() -> R) {
        withTestApplication({
            (environment.config as MapApplicationConfig).apply {
                put("authentication.jwt.enabled", "true")
                put("authentication.jwt.issuer", issuer)
                put("authentication.jwt.audience", audience)
            }

            ceresModule()
        }, block)
    }

    private fun createToken(prefix: String = "Bearer ",
                            issuer: String = this.issuer, audience: String = this.audience,
                            keyId: String = this.keyId, algorithm: Algorithm = this.algorithm,
                            expiresAt: Date = TOMORROW ) =
            prefix + JWT.create()
                    .withAudience(audience)
                    .withIssuer(issuer)
                    .withKeyId(keyId)
                    .withExpiresAt(expiresAt)
                    .sign(algorithm)


    override fun koinModules(): List<Module> {
        return super.koinModules() + applicationContext {
            bean { getJwkProviderMock() }
        }
    }

    private fun getJwkProviderMock(): JwkProvider {
        val jwk = mock<Jwk> {
            on { algorithm } doReturn algorithm.name
            on { publicKey } doReturn keyPair.public
        }
        return mock {
            on { get(keyId) } doReturn jwk
        }
    }
}