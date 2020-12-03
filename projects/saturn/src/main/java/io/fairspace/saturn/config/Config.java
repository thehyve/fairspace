package io.fairspace.saturn.config;


import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
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
import org.apache.jena.atlas.json.JSON;
import org.apache.jena.tdb2.params.StoreParams;
import org.apache.jena.tdb2.params.StoreParamsCodec;

import javax.validation.constraints.NotBlank;
import java.io.File;
import java.io.IOException;
import java.util.*;

public class Config {
    static final ObjectMapper MAPPER = new ObjectMapper(new YAMLFactory())
            .registerModule(new SimpleModule()
                    .addSerializer(new StoreParamsSerializer())
                    .addDeserializer(StoreParams.class, new StoreParamsDeserializer()));

    public int port = 8080;

    public String publicUrl = "http://localhost:8080";

    public Jena jena = new Jena();

    public Auth auth = new Auth();

    public WebDAV webDAV = new WebDAV();

    public ViewDatabase viewDatabase = new ViewDatabase();

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    public final Set<Feature> features = new HashSet<>();

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    public Map<String, String> services = new HashMap<>();

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    public List<Storage> storages = new LinkedList<>();

    public Search search = new Search();

    public static class Jena {
        public String metadataBaseIRI = "http://localhost/iri/";

        public File datasetPath = new File("data/db");

        public final StoreParams storeParams = StoreParams.getDftStoreParams();

        public File transactionLogPath = new File("data/log");

        public boolean bulkTransactions = true;
    }

    public static class Auth {
        public String authServerUrl = "http://localhost:5100/auth/";
        public String realm = "fairspace";
        public String clientId = "workspace-client";
        public boolean enableBasicAuth;
        public String superAdminUser = "organisation-admin";
    }

    public static class WebDAV {
        public String blobStorePath = "data/blobs";
    }

    public static class Search {
        public long pageRequestTimeout = 10_000;
        public long countRequestTimeout = 100_1000;
    }

    public static class Storage {
        @NotBlank public String name;
        @NotBlank public String label;
        @NotBlank public String url;
        public String rootDirectoryIri;
        public String searchUrl;

        public String getRootDirectoryIri() {
            if (rootDirectoryIri == null || rootDirectoryIri.trim().isEmpty()) {
                return url;
            }
            return rootDirectoryIri;
        }
    }

    public static class ViewDatabase {
        public boolean enabled = false;
        public String url = String.format("jdbc:postgresql://%s:%d/%s", "localhost", 9432, "fairspace");
        public String username = "fairspace";
        public String password = "fairspace";
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
