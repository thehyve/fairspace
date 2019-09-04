package io.fairspace.saturn.rdf.search;

import org.apache.jena.query.text.Entity;
import org.apache.jena.query.text.TextIndex;
import org.apache.jena.query.text.TextIndexConfig;
import org.apache.jena.query.text.es.TextIndexES;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.script.Script;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;

import static com.google.common.collect.Iterables.partition;
import static java.util.concurrent.Executors.newSingleThreadExecutor;
import static org.elasticsearch.common.xcontent.XContentFactory.jsonBuilder;

/**
 * Bulk Elastic Search Implementation of {@link TextIndex}
 */
public class TextIndexESBulk extends TextIndexES {
    /**
     * ES Script for adding/updating the document in the index.
     * The main reason to use scripts is because we want to modify the values of the fields that contains an array of values
     */
    private static final String ADD_UPDATE_SCRIPT = "if((ctx._source == null) || (ctx._source[params.field] == null) || ctx._source[params.field].empty) " +
            "{ctx._source[params.field]=[params.value]} else {ctx._source[params.field].add(params.value)}";

    /**
     * ES Script for deleting a specific value in the field for the given document in the index.
     * The main reason to use scripts is because we want to delete specific value of the field that contains an array of values
     */
    private static final String DELETE_SCRIPT = "if((ctx._source != null) && (ctx._source[params.field] != null) && (!ctx._source[params.field].empty) " +
            "&& (ctx._source[params.field].indexOf(params.value) >= 0)) " +
            "{ctx._source[params.field].remove(ctx._source[params.field].indexOf(params.value))}";

    private static final Logger LOGGER = LoggerFactory.getLogger(TextIndexESBulk.class);
    private static final int BULK_SIZE = 1000;

    private final Client client;
    private final String indexName;
    private final List<UpdateRequest> updates = new ArrayList<>();

    // Needed to avoid reordering or interference of bulk updates
    private final ExecutorService singleThreadExecutor = newSingleThreadExecutor();


    /**
     * Constructor used mainly for performing Integration tests
     *
     * @param config an instance of {@link TextIndexConfig}
     * @param client an instance of {@link TransportClient}. The client should already have been initialized with an index
     */
    public TextIndexESBulk(TextIndexConfig config, Client client, String indexName) {
        super(config, client, indexName);
        this.client = client;
        this.indexName = indexName;
    }

    @Override
    public void prepareCommit() {
        if (updates.isEmpty()) {
            return;
        }

        partition(updates, BULK_SIZE).forEach(bulk -> {
            var bulkRequest = new BulkRequest();
            bulk.forEach(bulkRequest::add);
            singleThreadExecutor.submit(() -> processBulkRequest(bulkRequest));
        });

        updates.clear();
    }

    private void processBulkRequest(BulkRequest bulk) {
        try {
            var response = client.bulk(bulk).get();
            LOGGER.debug("Indexing {} updates in ElasticSearch took {} ms",
                    response.getItems().length,
                    response.getIngestTook().millis() + response.getTook().millis());
            if (response.hasFailures()) {
                LOGGER.error(response.buildFailureMessage());
            }
        } catch (Exception e) {
            LOGGER.error("Error indexing in ElasticSearch", e);
        }
    }

    @Override
    public void rollback() {
        updates.clear();
    }

    @Override
    public void close() {
        updates.clear();
        singleThreadExecutor.shutdown();
    }

    /**
     * Update an Entity. Since we are doing Upserts in add entity anyway, we simply call {@link #addEntity(Entity)}
     * method that takes care of updating the Entity as well.
     *
     * @param entity the entity to update.
     */
    @Override
    public void updateEntity(Entity entity) {
        //Since Add entity also updates the indexed document in case it already exists,
        // we can simply call the addEntity from here.
        addEntity(entity);
    }


    /**
     * Add an Entity to the ElasticSearch Index.
     * The entity will be added as a new document in ES, if it does not already exists.
     * If the Entity exists, then the entity will simply be updated.
     * The entity will never be replaced.
     *
     * @param entity the entity to add
     */
    @Override
    public void addEntity(Entity entity) {
        LOGGER.trace("Adding/Updating the entity {} in ES", entity.getId());

        try {
            var entry = getDataEntry(entity);
            var builder = jsonBuilder()
                    .startObject()
                    .field(getDocDef().getEntityField(), entity.getId())
                    .field(entry.getKey(), List.of(entry.getValue()))
                    .endObject();
            var indexRequest = new IndexRequest(indexName, getDocDef().getEntityField(), entity.getId())
                    .source(builder);
            var upReq = new UpdateRequest(indexName, getDocDef().getEntityField(), entity.getId())
                    .script(new Script(Script.DEFAULT_SCRIPT_TYPE, Script.DEFAULT_SCRIPT_LANG, ADD_UPDATE_SCRIPT, toParams(entity)))
                    .upsert(indexRequest);
            updates.add(upReq);
        } catch (Exception e) {
            LOGGER.error("Unable to Index the Entity in ElasticSearch.", e);
        }
    }

    /**
     * Delete the value of the entity from the existing document, if any.
     * The document itself will never get deleted. Only the value will get deleted.
     *
     * @param entity entity whose value needs to be deleted
     */
    @Override
    public void deleteEntity(Entity entity) {
        updates.add(new UpdateRequest(indexName, getDocDef().getEntityField(), entity.getId())
                .script(new Script(Script.DEFAULT_SCRIPT_TYPE, Script.DEFAULT_SCRIPT_LANG, DELETE_SCRIPT, toParams(entity))));
    }

    private static Map<String, Object> toParams(Entity entity) {
        var entry = getDataEntry(entity);
        return Map.of("field", entry.getKey(), "value", entry.getValue());
    }

    private static Map.Entry<String, Object> getDataEntry(Entity entity) {
        return entity.getMap().entrySet().iterator().next();
    }
}
