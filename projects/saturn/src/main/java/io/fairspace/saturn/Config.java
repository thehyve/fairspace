package io.fairspace.saturn;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.apache.jena.query.text.es.ESSettings;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

public class Config {
    public int port = 8080;

    public String publicUrl = "http://localhost:3000";

    public final Jena jena = new Jena();

    public final Auth auth = new Auth();

    public final WebDAV webDAV = new WebDAV();

    public final Properties mail = new Properties();

    public final Users users = new Users();

    public static class Jena {
        public String metadataBaseIRI = "http://localhost/iri/";
        public String vocabularyBaseIRI = "http://localhost/vocabulary/";

        public File datasetPath = new File("data/db");

        public File transactionLogPath = new File("data/log");

        public long maxTriplesToReturn = 50000;

        public ElasticSearch elasticSearch = new ElasticSearch();

        public static class ElasticSearch {
            public boolean enabled = false;
            public boolean required = false;
            public ESSettings settings = new ESSettings.Builder()
                    .clusterName("fairspace")
                    .hostAndPort("127.0.0.1", 9300)
                    .build();
            public Map<String, String> advancedSettings = new HashMap<>(Map.of("transport.netty.worker_count", "1"));
        }
    }

    public static class Auth {
        public boolean enabled = false;

        public Set<String> developerRoles = Set.of("user", "datasteward", "sparql");

        public String jwksUrl = "https://keycloak.hyperspace.ci.fairway.app/auth/realms/ci/protocol/openid-connect/certs";

        public String jwtAlgorithm = "RS256";

        public String workspaceUserRole = "user";

        public String dataStewardRole = "datasteward";

        public String sparqlRole = "sparql";
    }

    public static class WebDAV {
        public String blobStorePath = "data/blobs";
    }

    public static class Users {
        public String endpoint  = "http://localhost:8080/api/v1/workspace/users";

        public int synchronizationInterval = 60;
    }

    @Override
    public String toString() {
        try {
            return new ObjectMapper(new YAMLFactory()).writeValueAsString(this);
        } catch (JsonProcessingException e) {
            return super.toString();
        }
    }
}
