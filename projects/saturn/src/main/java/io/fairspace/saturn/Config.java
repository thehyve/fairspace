package io.fairspace.saturn;


import java.net.MalformedURLException;
import java.net.URL;

public class Config {
    public int port = 8080;

    public Jena jena = new Jena();

    public Auth auth = new Auth();

    public static class Jena {
        public String datasetPath = "data/db";

        public String transactionLogPath = "data/log";

        public String vocabularyURI = "http://fairspace.io/vocabulary#";
    }

     public static class Auth {
         public boolean authEnabled = false;

         public String jwksUrl = "https://keycloak.hyperspace.ci.fairway.app/auth/realms/ci/protocol/openid-connect/certs";

         public String jwtAlgorithm = "RS256";
     }
}
