package io.fairspace.saturn;


public class Config {
    public int port = 8080;

    public Jena jena = new Jena();

    public Auth auth = new Auth();

    public WebDAV webDAV = new WebDAV();

    public static class Jena {
        public String baseURI = "http://localhost/iri/";

        public String datasetPath = "data/db";

        public String transactionLogPath = "data/log";
    }

    public static class Auth {
        public boolean authEnabled = false;

        public String jwksUrl = "https://keycloak.hyperspace.ci.fairway.app/auth/realms/ci/protocol/openid-connect/certs";

        public String jwtAlgorithm = "RS256";
    }

    public static class WebDAV {
        public String blobStorePath = "data/blobs";
    }
}
