package io.fairspace.saturn.services.views;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;
import com.zaxxer.hikari.*;
import io.fairspace.saturn.config.*;
import io.fairspace.saturn.config.SearchConfig.*;
import lombok.*;
import lombok.extern.slf4j.*;

import java.sql.*;
import java.util.*;
import java.util.stream.*;

import static io.fairspace.saturn.services.views.Table.idColumn;
import static io.fairspace.saturn.services.views.Table.valueColumn;

@Slf4j
public class ViewStoreClientFactory {
    public static ViewStoreClient build(SearchConfig searchConfig) throws SQLException {
        var factory = new ViewStoreClientFactory(searchConfig);
        return new ViewStoreClient(
                searchConfig,
                factory.connection,
                factory.viewTables,
                factory.propertyTables,
                factory.joinTables);
    }

    public static String databaseTypeForColumnType(ColumnType type) {
        return switch (type) {
            case Text -> "text";
            case Number -> "numeric";
            case Identifier -> "text not null";
            case Set -> "jsonb";
        };
    }

    final Connection connection;
    final Map<String, Table> viewTables = new HashMap<>();
    final Map<String, Map<String, Table>> propertyTables = new HashMap<>();
    final Map<String, Map<String, Table>> joinTables = new HashMap<>();

    public ViewStoreClientFactory(SearchConfig searchConfig) throws SQLException {
        log.debug("Initializing the PostgreSQL connection");
        var config = new HikariConfig();
        String url = String.format("jdbc:postgresql://%s:%d/%s", "localhost", 9433, "fairspace");
        config.setJdbcUrl(url);
        config.setUsername("fairspace");
        config.setPassword("fairspace");
        config.setAutoCommit(false);
        var dataSource = new HikariDataSource(config);
        this.connection = dataSource.getConnection();

        log.info("PostgreSQL connection: {}", connection.getMetaData().getDatabaseProductName());

        for (SearchConfig.View view: searchConfig.views) {
            ensureViewExists(view);
        }
    }

    Map<String, ColumnMetadata> getColumnMetadata(String table) throws SQLException {
        log.debug("Fetching metadata for {} ...", table);
        var resultSet = connection.getMetaData().getColumns(null, null, table, null);
        var result = new LinkedHashMap<String, ColumnMetadata>();
        while (resultSet.next()) {
            String columnName   = resultSet.getString("COLUMN_NAME");
            String dataTypeName = resultSet.getString("TYPE_NAME");
            Boolean nullable = resultSet.getBoolean("NULLABLE");
            var metadata = ColumnMetadata.builder()
                    .type(dataTypeName)
                    .nullable(nullable)
                    .build();
            result.put(columnName, metadata);
        }
        return result;
    }

    void ensureTableExists(Table table) throws SQLException {
        log.info("Check if table {} exists ...", table.name);
        var resultSet = connection.getMetaData().getTables(null, null, table.name, null);
        var tableExists = resultSet.next();
        if (!tableExists) {
            // Create new table
            connection.setAutoCommit(true);
            var columnSpecification =
                table.columns.stream().map(column ->
                        String.format("%s %s", column.name, databaseTypeForColumnType(column.type))
                ).collect(Collectors.joining(", "));
            var keys = table.columns.stream()
                    .filter(column -> column.type == ColumnType.Identifier)
                    .map(column -> column.name)
                    .collect(Collectors.joining(", "));
            var command = String.format("create table %s ( %s, primary key ( %s ) )", table.name, columnSpecification, keys);
            log.info(command);
            connection.createStatement().execute(command);
            connection.setAutoCommit(false);
            log.info("Table {} created.", table.name);
        } else {
            var columnMetadata = getColumnMetadata(table.name);
            var newColumns = table.columns.stream()
                    .filter(column -> !columnMetadata.containsKey(column.name))
                    .collect(Collectors.toList());
            try {
                log.info("New columns: {}", new ObjectMapper().writeValueAsString(newColumns));
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            // Update existing table
            if (!newColumns.isEmpty()) {
                connection.setAutoCommit(true);
                var command = newColumns.stream().map(column ->
                        String.format("alter table %s add column %s %s",
                                table.name, column.name, databaseTypeForColumnType(column.type))
                ).collect(Collectors.joining("; "));
                log.info(command);
                connection.createStatement().execute(command);
                connection.setAutoCommit(false);
                log.info("Table {} updated.", table.name);
            }
        }
    }

    void ensureViewExists(SearchConfig.View view) throws SQLException {
        // Add view table
        var table = Table.builder()
                .name(view.name.toLowerCase())
                .columns(Stream.concat(
                        Stream.of(idColumn()),
                        Stream.concat(
                            view.columns.stream()
                                    .map(column -> valueColumn(column.name, column.type)),
                            view.columns.stream()
                                    .filter(column -> column.type == ColumnType.Set)
                                    .map(column -> valueColumn(column.name + "_string", ColumnType.Text))
                        )
                ).collect(Collectors.toList()))
                .build();
        ensureTableExists(table);
        viewTables.put(view.name, table);
        // Add property tables
        for (View.Column column : view.columns) {
            if (column.type != ColumnType.Set) {
                continue;
            }
            var propertyTable = Table.builder()
                    .name(String.format("%s_%s", view.name.toLowerCase(), column.name.toLowerCase()))
                    .columns(Arrays.asList(
                            idColumn(view.name),
                            valueColumn(column.name, ColumnType.Identifier)
                    ))
                    .build();
            ensureTableExists(propertyTable);
            propertyTables.putIfAbsent(view.name, new HashMap<>());
            propertyTables.get(view.name).put(column.name, propertyTable);
        }
        if (view.join != null) {
            // Add join tables
            for (SearchConfig.View.JoinView join: view.join) {
                String left = join.reverse ? join.view : view.name;
                String right = join.reverse ? view.name : join.view;
                var joinTable = Table.builder()
                        .name(String.format("%s_%s", left.toLowerCase(), right.toLowerCase()))
                        .columns(Arrays.asList(
                                idColumn(left),
                                idColumn(right)
                        ))
                        .build();
                ensureTableExists(joinTable);
                joinTables.putIfAbsent(view.name, new HashMap<>());
                joinTables.get(view.name).put(join.view, joinTable);
            }
        }
    }

    @Data @Builder
    public static class ColumnMetadata {
        String type;
        Boolean nullable;
    }
}
