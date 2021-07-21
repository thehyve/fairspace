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
import java.util.function.Function;
import java.util.stream.Collectors;

@Log4j2
public class MaintenanceService {
    private final ExecutorService threadpool = Executors.newSingleThreadExecutor();
    private final Dataset dataset;
    private final ViewStoreClientFactory viewStoreClientFactory;

    public MaintenanceService(@NonNull Dataset dataset, ViewStoreClientFactory viewStoreClientFactory) {
        this.dataset = dataset;
        this.viewStoreClientFactory = viewStoreClientFactory;
    }

    private static boolean isRunning = false;

    public boolean available() {
        return viewStoreClientFactory != null;
    }

    public String resetPostgres() {
        if (!available()) {
            throw new RuntimeException("Not available");
        }
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
        runResetSteps(updateId);
//
        return "update started, please use {uri} to monitor progress";
    }

    private void runResetSteps(UUID updateId) {

        try {
            // index entities
            for (var view : ConfigLoader.VIEWS_CONFIG.views) {
                indexData(view);
            }

            var joinTables = getJoinTablesToIndex(); // -> if postgres contains no foreign keys doesn't need to be a separate step...

            // index entity relations (view.join's?)

            // set status 'finished' and success 1 in table
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            // set status 'finished', with error message and success 0 in table
        }

        isRunning = false;
        // set status finished and success 1
    }

    private void indexData(ViewsConfig.View view) throws SQLException {
        // clear postgres table
        var viewStoreClient = viewStoreClientFactory.build();
        viewStoreClient.truncateTable(view.name.toLowerCase());

        for(String type : view.types) {
            String query = getQuery(view, type);

            var columnNames = view.columns.stream()
                    .filter(c -> !c.type.isSet())
                    .map(c -> c.name)
                    .collect(Collectors.toList());
            columnNames.add(0, "id");
            columnNames.add(1, "label");

            Function<List<String[]>, Integer> insertIntoPostgres = getPostgresInsertFunction(
                    viewStoreClient, view, columnNames);

            SparqlUtils.copyData(dataset,
                    query,
                    (QuerySolution q) -> getEntity(columnNames, q),
                    insertIntoPostgres);
        }
    }

    private Function<List<String[]>, Integer> getPostgresInsertFunction(
            ViewStoreClient viewStoreClient, ViewsConfig.View view, List<String> columnNames) {
        var columnTypes = view.columns.stream().map(c -> c.type).collect(Collectors.toList());
        columnTypes.add(0, ViewsConfig.ColumnType.Text);
        columnTypes.add(1, ViewsConfig.ColumnType.Text);
        var columnTypeArray = columnTypes.toArray(ViewsConfig.ColumnType[]::new);

        return (List<String[]> values) ->
        {
            int rowsAffected = viewStoreClient.insertValues(view.name, columnNames, columnTypeArray, values);
            if (rowsAffected != values.size()) {
                throw new RuntimeException("Unexpected amount of row inserts");
            }

            return rowsAffected;
        };
    }

    private String getQuery(ViewsConfig.View view, String type) {
        var attributes = view.columns.stream()
                .map(this::getColumnSelect)
                .collect(Collectors.joining());
        var attributeNames = view.columns.stream()
                .map(c -> "?" + c.name)
                .collect(Collectors.joining(" "));

        var query = """
                    SELECT ?id ?label {attributeNames}
                    WHERE {
                        ?id <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <{type}> .
                        {attributes}
                        ?id <http://www.w3.org/2000/01/rdf-schema#label> ?label .
                    }
                """;

        query = query.replaceAll("\\{type}", type);
        query = query.replaceAll("\\{attributes}", attributes);
        query = query.replaceAll("\\{attributeNames}", attributeNames);
        return query;
    }

    private String getColumnSelect(ViewsConfig.View.Column c) {
        if (c.type.name().equals("Term")) {
            return "OPTIONAL {?id <" + c.source + "> " + "?" + c.name + "Id .\n" +
                    "?" + c.name + "Id <http://www.w3.org/2000/01/rdf-schema#label> ?" + c.name + " . }\n";
        }

        return "OPTIONAL {?id <" + c.source + "> " + "?" + c.name + " . }\n";
    }

    private List<String> getJoinTablesToIndex() {
        var joinTables = new ArrayList<String>();
        for (ViewsConfig.View view : ConfigLoader.VIEWS_CONFIG.views) {
            for (ViewsConfig.View.JoinView join : view.join) {
                var joinTable = ViewStoreClientFactory.getJoinTable(join, view).getName();
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
        // todo
        return true;
    }

    private String[] getEntity(List<String> columns, QuerySolution result) {
        var values = new String[columns.size()];

        result.varNames().forEachRemaining(e ->
        {
            int columnIndex = columns.indexOf(e);

            if (result.get(e).isLiteral()) {
                values[columnIndex] = "'" + result.getLiteral(e).getValue().toString() + "'";
            } else {
                values[columnIndex] = "'" + result.getResource(e).asNode().getURI() + "'";
            }
        });

        return values;
    }
}
