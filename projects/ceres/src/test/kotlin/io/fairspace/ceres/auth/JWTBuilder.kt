package io.fairspace.ceres.auth

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jwt.JWT
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.PlainJWT
import com.nimbusds.jwt.SignedJWT
import java.security.interfaces.RSAPrivateKey
import java.util.*

class JWTBuilder {
    var keyId: String? = null
        private set

    var privateKey: RSAPrivateKey? = null
        private set

    var expires = Date(Date().time + 60 * 1000)
        private set

    var authorities = listOf("user-workspace")
        private set

    var subject = "Alice"
        private set

    val jwtClaimsSet: JWTClaimsSet
        get() = JWTClaimsSet.Builder()
                .subject(subject)
                .expirationTime(expires)
                .claim("authorities", authorities)
                .build()

    fun expires(expires: Date): JWTBuilder {
        this.expires = expires
        return this
    }

    fun keyId(keyId: String): JWTBuilder {
        this.keyId = keyId
        return this
    }

    fun privateKey(privateKey: RSAPrivateKey): JWTBuilder {
        this.privateKey = privateKey
        return this
    }

    fun signWith(keyId: String, privateKey: RSAPrivateKey): JWTBuilder {
        this.keyId = keyId
        this.privateKey = privateKey
        return this
    }

    fun authorities(authorities: List<String>): JWTBuilder {
        this.authorities = authorities
        return this
    }

    fun subject(subject: String): JWTBuilder {
        this.subject = subject
        return this
    }

    @Throws(JOSEException::class)
    fun build(): JWT {
        return if (privateKey == null) {
            buildUnsigned()
        } else {
            buildSigned()
        }
    }

    @Throws(JOSEException::class)
    private fun buildSigned(): SignedJWT {
        // Create RSA-signer with the private key
        val signer = RSASSASigner(privateKey!!)

        val claimsSet = jwtClaimsSet
        val header = JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(keyId)
                .build()

        val signedJWT = SignedJWT(header, claimsSet)

        // Compute the RSA signature
        signedJWT.sign(signer)

        return signedJWT
    }

    private fun buildUnsigned(): PlainJWT {
        val claimsSet = jwtClaimsSet
        return PlainJWT(claimsSet)
    }
}
