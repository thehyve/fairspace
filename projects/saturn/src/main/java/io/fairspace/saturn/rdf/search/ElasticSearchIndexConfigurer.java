package io.fairspace.saturn.rdf.search;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.text.TextIndexException;
import org.apache.jena.query.text.es.ESSettings;
import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsRequest;
import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.IndicesAdminClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentType;

import java.io.IOException;

import static java.nio.charset.StandardCharsets.UTF_8;

@Slf4j
@Getter
public class ElasticSearchIndexConfigurer {
    private static final String NUM_OF_SHARDS_PARAM = "number_of_shards";
    private static final String NUM_OF_REPLICAS_PARAM = "number_of_replicas";
    private static final String IRI_TYPE = "iri";

    /**
     * Configures the specified index with a specific analyzer for filePaths
     */
    public static void configure(Client client, ESSettings esSettings, boolean recreateIndex) {
        String indexName = esSettings.getIndexName();
        IndicesAdminClient indicesAdminClient = client.admin().indices();

        try {
            IndicesExistsResponse exists = indicesAdminClient.exists(new IndicesExistsRequest(indexName)).get();

            if (recreateIndex && exists.isExists()) {
                log.info("Deleting an existing index.");
                indicesAdminClient.prepareDelete(indexName).get();
            }

            if (!exists.isExists() || recreateIndex) {
                log.info("Index with name {} does not exist yet. Creating one.", indexName);

                client.admin().indices()
                        .prepareCreate(indexName)
                        .setSettings(
                                getSettings()
                                        .put(NUM_OF_SHARDS_PARAM, esSettings.getShards())
                                        .put(NUM_OF_REPLICAS_PARAM, esSettings.getReplicas())
                        )
                        .addMapping(IRI_TYPE, getMappings(), XContentType.JSON)
                        .get();
            } else {
                log.info("Updating settings for index with name {}", indexName);

                indicesAdminClient.prepareClose(indexName).get();

                indicesAdminClient.prepareUpdateSettings(indexName)
                        .setSettings(getSettings())
                        .get();

                try {
                    // Updating mappings can only be done when fields are not being used
                    // Otherwise, updating the mappings will result in an exception.
                    // To quote ES:
                    //
                    // In order to make your data searchable, your database needs to know what
                    // type of data each field contains and how it should be indexed. If you
                    // switch a field type from e.g. a string to a date, all of the data for that
                    // field that you already have indexed becomes useless. One way or another,
                    // you need to reindex that field.
                    // (https://www.elastic.co/blog/changing-mapping-with-zero-downtime)
                    //
                    // We currently do not have any reindexing behaviour, so we ignore the problem
                    // for now.

                    indicesAdminClient.preparePutMapping(indexName)
                            .setType(IRI_TYPE)
                            .setSource(getMappings(), XContentType.JSON)
                            .get();
                } catch (Exception e) {
                    log.warn("Error while updating ES mappings", e);
                }

                indicesAdminClient.prepareOpen(indexName).get();
            }
        } catch (Exception e) {
            throw new TextIndexException("Exception occurred while instantiating ElasticSearch Text Index", e);
        }
    }

    private static String getMappings() throws IOException {
        try (var is = ElasticSearchIndexConfigurer.class.getResourceAsStream("/elasticsearch/mappings.json")) {
            return new String(is.readAllBytes(), UTF_8);
        }
    }

    private static Settings.Builder getSettings() throws IOException {
        return Settings.builder()
                .loadFromStream("es-settings.json", ElasticSearchIndexConfigurer.class.getResourceAsStream("/elasticsearch/settings.json"), false);
    }
}
