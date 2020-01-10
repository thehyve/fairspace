package io.fairspace.saturn.config;


import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.apache.jena.atlas.json.JSON;
import org.apache.jena.query.text.es.ESSettings;
import org.apache.jena.tdb2.params.StoreParams;
import org.apache.jena.tdb2.params.StoreParamsCodec;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class Config {
    static final ObjectMapper MAPPER = new ObjectMapper(new YAMLFactory())
            .registerModule(new SimpleModule()
                    .addSerializer(new StoreParamsSerializer())
                    .addDeserializer(StoreParams.class, new StoreParamsDeserializer()));

    public int port = 8080;

    public String publicUrl = "http://localhost:3000";

    public final Jena jena = new Jena();

    public final Auth auth = new Auth();

    public final WebDAV webDAV = new WebDAV();

    public final Properties mail = new Properties();

    public final Workspace workspace = new Workspace();

    public final RabbitMQ rabbitMQ = new RabbitMQ();

    public static class Jena {
        public String metadataBaseIRI = "http://localhost/iri/";
        public String vocabularyBaseIRI = "http://localhost/vocabulary/";

        public File datasetPath = new File("data/db");

        public final StoreParams storeParams = StoreParams.getDftStoreParams();

        public File transactionLogPath = new File("data/log");

        public long maxTriplesToReturn = 50000;

        public long inactiveConnectionShutdownIntervalSec  = 600;

        public ElasticSearch elasticSearch = new ElasticSearch();

        public static class ElasticSearch {
            public boolean enabled = false;
            public boolean required = false;
            public ESSettings settings = new ESSettings.Builder()
                    .clusterName("fairspace")
                    .hostAndPort("127.0.0.1", 9300)
                    .build();
            public Map<String, String> advancedSettings = new HashMap<>();
        }
    }

    public static class Auth {
        public boolean enabled = false;

        public List<String> developerRoles = List.of("user", "datasteward", "sparql");

        public String jwksUrl = "https://keycloak.hyperspace.ci.fairway.app/auth/realms/ci/protocol/openid-connect/certs";

        public String jwtAlgorithm = "RS256";

        public String fullAccessRole = "coordinator";
    }

    public static class WebDAV {
        public String blobStorePath = "data/blobs";
    }

    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RabbitMQ {
        @Builder.Default
        public boolean enabled = false;
        @Builder.Default
        public boolean required = true;

        @Builder.Default
        public String host = "localhost";
        @Builder.Default
        public int port = 5672;
        public String username;
        public String password;
        @Builder.Default
        public String virtualHost = "/";
        @Builder.Default
        public String exchangeName = "fairspace";
    }

    public static class Workspace {
        public String id = "workspace";
        public String name = "Workspace";
        public String version = "1.0.0";
    }

    @Override
    public String toString() {
        try {
            return MAPPER.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            return super.toString();
        }
    }

    public static class StoreParamsSerializer extends StdSerializer<StoreParams> {
        public StoreParamsSerializer() {
            super(StoreParams.class);
        }

        @Override
        public void serialize(StoreParams value, JsonGenerator gen, SerializerProvider provider) throws IOException {
            var node = MAPPER.readTree(StoreParamsCodec.encodeToJson(value).toString());
            gen.writeObject(node);
        }
    }

    public static class StoreParamsDeserializer extends StdDeserializer<StoreParams> {
        protected StoreParamsDeserializer() {
            super(StoreParams.class);
        }

        @Override
        public StoreParams deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            return StoreParamsCodec.decode(JSON.parse(p.readValueAsTree().toString()));
        }
    }
}
