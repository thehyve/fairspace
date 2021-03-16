package nl.fairspace.pluto;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.PlainJWT;
import com.nimbusds.jwt.SignedJWT;

import java.security.interfaces.RSAPrivateKey;
import java.util.Collections;
import java.util.Date;
import java.util.List;

public class JWTBuilder {
    private String keyId;

    private RSAPrivateKey privateKey;

    private Date expires = new Date(new Date().getTime() + 60 * 1000);

    private List<String> authorities = Collections.singletonList("user-workspace");
    private String subject = "Alice";

    public Date getExpires() {
        return expires;
    }

    public String getKeyId() {
        return keyId;
    }

    public RSAPrivateKey getPrivateKey() {
        return privateKey;
    }

    public List<String> getAuthorities() {
        return authorities;
    }

    public String getSubject() {
        return subject;
    }

    public JWTBuilder expires(Date expires) {
        this.expires = expires;
        return this;
    }

    public JWTBuilder keyId(String keyId) {
        this.keyId = keyId;
        return this;
    }

    public JWTBuilder privateKey(RSAPrivateKey privateKey) {
        this.privateKey = privateKey;
        return this;
    }

    public JWTBuilder signWith(String keyId, RSAPrivateKey privateKey) {
        this.keyId = keyId;
        this.privateKey = privateKey;
        return this;
    }

    public JWTBuilder authorities(List<String> authorities) {
        this.authorities = authorities;
        return this;
    }

    public JWTBuilder subject(String subject) {
        this.subject = subject;
        return this;
    }

    public JWT build() throws JOSEException {
        if(privateKey == null) {
            return buildUnsigned();
        } else {
            return buildSigned();
        }
    }

    private SignedJWT buildSigned() throws JOSEException {
        // Create RSA-signer with the private key
        JWSSigner signer = new RSASSASigner(privateKey);

        JWTClaimsSet claimsSet = getJwtClaimsSet();
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(keyId)
                .build();

        SignedJWT signedJWT = new SignedJWT(header, claimsSet);

        // Compute the RSA signature
        signedJWT.sign(signer);

        return signedJWT;
    }

    private PlainJWT buildUnsigned() {
        JWTClaimsSet claimsSet = getJwtClaimsSet();
        return new PlainJWT(claimsSet);
    }

    private JWTClaimsSet getJwtClaimsSet() {
        // Prepare JWT with claims set
        return new JWTClaimsSet.Builder()
                .subject(subject)
                .expirationTime(expires)
                .claim("authorities", authorities)
                .build();
    }
}
