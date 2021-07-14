package io.fairspace.saturn.services.maintenance;

import io.fairspace.saturn.config.ConfigLoader;
import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.rdf.SparqlUtils;
import io.fairspace.saturn.services.views.ViewStoreClient;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.QuerySolution;

import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Log4j2
public class MaintenanceService {
    private final ExecutorService threadpool = Executors.newSingleThreadExecutor();
    private final Dataset dataset;
    private final ViewStoreClient viewStoreClient;

    public MaintenanceService(@NonNull Dataset dataset, @NonNull ViewStoreClient viewStoreClient) {
        this.dataset = dataset;
        this.viewStoreClient = viewStoreClient;
    }

    private static boolean isRunning = false;

    public String ResetPostgres() {
        var updateId = UUID.randomUUID();

        // check if we can start a reset
        var canStart = canStart(updateId);
        if (isRunning) {
            log.info("An update process is running, can't run a new update simultaneous");
            return "update is allready running";
        }
        isRunning = true;

// TEST synchronous for test only:
//        threadpool.submit(() -> {
//            log.info("Start asynchronous postgres reset");
//            RunResetSteps(updateId);
//        });
RunResetSteps(updateId);
//

        return "OK";
        // return "update started, please use {uri} to monitor progress";
    }

    private void RunResetSteps(UUID updateId) {

        try {
            // clear tables
            var entityTables = getEntityTablesToIndex();
            var joinTables = getJoinTablesToIndex();

            // index entities
            for (var view : ConfigLoader.VIEWS_CONFIG.views) {
                IndexData(view);
            }

            // index entity relations (view.join's?)

            // index resources

            // index resource relations

            isRunning = false;
        } catch (Exception e) {
            log.error(e.getMessage(), e);

            // set status 'finished', with error message and success 0 in table
        }

        // set status finished and success 1
    }


    private void IndexData(ViewsConfig.View view) throws SQLException {
        int pageSize = 1000;
        int offset = 0;
        int rowsUpdated = 0;

        // clear postgres table
        viewStoreClient.truncateTable(view.name.toLowerCase());

        // fill postgres table with data from jena
        do {
            rowsUpdated = copyRdfData(view, pageSize, offset);
            offset += pageSize;
        } while (rowsUpdated > 0);
    }

    private int copyRdfData(ViewsConfig.View view, int pageSize, int offset) throws SQLException {
        var attributes = view.columns.stream()
                .map(c -> GetColumnSelect(c))
                .collect(Collectors.joining());
        var attributeNames = view.columns.stream()
                .map(c -> "?" + c.name)
                .collect(Collectors.joining(" "));

        // todo: distinct, ordered, and paged
        var query01 = """
                    SELECT DISTINCT ?id ?label {attributeNames}
                    WHERE {
                        ?id <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <{type}> .
                        {attributes}
                        ?id <http://www.w3.org/2000/01/rdf-schema#label> ?label .
                    }
                    ORDER BY ?id
                    LIMIT {pagesize} OFFSET {offset}
                """;

        query01 = query01.replaceAll("\\{type}", view.types.get(0));
        query01 = query01.replaceAll("\\{attributes}", attributes);
        query01 = query01.replaceAll("\\{attributeNames}", attributeNames);
        query01 = query01.replaceAll("\\{pagesize}", String.valueOf(pageSize));
        query01 = query01.replaceAll("\\{offset}", String.valueOf(offset));

        // while result, per 1000 oid:
        // extract values from Jena
        var tableValues = SparqlUtils.select(dataset, query01, this::getEntity);

        // insert into postgres
        return viewStoreClient.insertValues(view.name, tableValues);
    }

    private String GetColumnSelect(ViewsConfig.View.Column c) {
        if (c.type.name().equals("Term")) {
            return "OPTIONAL {?id <" + c.source + "> " + "?" + c.name + "Id .\n" +
                    "?" + c.name + "Id <http://www.w3.org/2000/01/rdf-schema#label> ?" + c.name + " . }\n";
        }

        return "OPTIONAL {?id <" + c.source + "> " + "?" + c.name + " . }\n";
    }

    private List<String> getEntityTablesToIndex() {
        var entities = new ArrayList<String>();
        for (ViewsConfig.View view : ConfigLoader.VIEWS_CONFIG.views) {
            entities.add(view.name);
        }

        return entities;
    }

    private List<String> getJoinTablesToIndex() {
        var joinTables = new ArrayList<String>();
        for (ViewsConfig.View view : ConfigLoader.VIEWS_CONFIG.views) {
            for (ViewsConfig.View.JoinView join : view.join) {
                var joinTable = ViewStoreClientFactory.GetJoinTable(join, view).getName();
                joinTables.add(joinTable);
            }
        }

        return joinTables;
    }

    /**
     * Check in database if a reset process is running.
     *
     * @param updateId Update id is used to track status of the asynchronous process
     * @return 'true' if a new reset can start, 'false' if a reset is already in progress.
     */
    private boolean canStart(UUID updateId) {
        return true;
    }

    private Map<String, String> getEntity(QuerySolution result) {

        var values = new HashMap<String, String>();

        result.varNames().forEachRemaining(e ->
        {
            if (result.get(e).isLiteral()) {
                values.put(e, "'" + result.getLiteral(e).getValue().toString() + "'");
            } else {
                values.put(e, "'" + result.getResource(e).asNode().getURI() + "'");
            }
        });

        return values;
    }
}
