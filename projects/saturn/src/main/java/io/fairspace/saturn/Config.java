package io.fairspace.saturn;


import org.apache.jena.query.text.es.ESSettings;

public class Config {
    public String baseURI = "http://localhost";

    public int port = 8080;

    public Jena jena = new Jena();

    public Auth auth = new Auth();

    public WebDAV webDAV = new WebDAV();

    public static class Jena {
        public String datasetPath = "data/db";

        public String transactionLogPath = "data/log";

        public String vocabularyURI = "http://fairspace.io/vocabulary#";

        public ElasticSearch elasticSearch = new ElasticSearch();

        public static class ElasticSearch {
            public boolean enabled = false;
            public ESSettings settings = new ESSettings.Builder().hostAndPort("localhost", 9300).build();
        }
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
