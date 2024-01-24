package io.fairspace.saturn.services.views;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;
import com.zaxxer.hikari.*;
import io.fairspace.saturn.config.*;
import io.fairspace.saturn.config.ViewsConfig.*;
import io.fairspace.saturn.vocabulary.*;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.*;

import javax.sql.*;
import java.sql.*;
import java.util.*;
import java.util.stream.*;

import static io.fairspace.saturn.services.views.Table.idColumn;
import static io.fairspace.saturn.services.views.Table.valueColumn;

@Slf4j
public class ViewStoreClientFactory {
    public static boolean H2_DATABASE = false;

    public ViewStoreClient build() throws SQLException {
        return new ViewStoreClient(getConnection(), configuration);
    }

    public static String databaseTypeForColumnType(ColumnType type) {
        return switch (type) {
            case Text, Term -> "text";
            case Date -> "timestamp";
            case Number -> "numeric";
            case Boolean -> "boolean";
            case Identifier -> H2_DATABASE ? "varchar not null" : "text not null";
            case Set, TermSet -> throw new IllegalArgumentException("No database type for column type set.");
        };
    }

    public static final Set<String> protectedResources = Set.of(
            FS.COLLECTION_URI,
            FS.DIRECTORY_URI,
            FS.FILE_URI);

    final ViewStoreClient.ViewStoreConfiguration configuration;
    public final DataSource dataSource;

    public ViewStoreClientFactory(ViewsConfig viewsConfig, Config.ViewDatabase viewDatabase) throws SQLException {
        log.debug("Initializing the database connection");
        var databaseConfig = new HikariConfig();
        databaseConfig.setJdbcUrl(viewDatabase.url);
        databaseConfig.setUsername(viewDatabase.username);
        databaseConfig.setPassword(viewDatabase.password);
        databaseConfig.setAutoCommit(false);
        databaseConfig.setConnectionTimeout(1000);
        databaseConfig.setMaximumPoolSize(50);

        dataSource = new HikariDataSource(databaseConfig);

        try (var connection = dataSource.getConnection()) {
            log.debug("Database connection: {}", connection.getMetaData().getDatabaseProductName());
        }

        createOrUpdateTable(Table.builder()
                .name("label")
                .columns(List.of(
                        idColumn(),
                        valueColumn("type", ColumnType.Text),
                        valueColumn("label", ColumnType.Text)))
                .build());

        configuration = new ViewStoreClient.ViewStoreConfiguration(viewsConfig);
        for (View view : viewsConfig.views) {
            createOrUpdateView(view);
        }
    }

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    Map<String, ColumnMetadata> getColumnMetadata(Connection connection, String table) throws SQLException {
        log.debug("Fetching metadata for {} ...", table);
        var resultSet = connection.getMetaData().getColumns(null, null, table, null);
        var result = new LinkedHashMap<String, ColumnMetadata>();
        while (resultSet.next()) {
            String columnName = resultSet.getString("COLUMN_NAME");
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

    void createOrUpdateTable(Table table) throws SQLException {
        try (var connection = getConnection()) {
            log.debug("Check if table {} exists ...", table.name);
            var resultSet = connection.getMetaData().getTables(null, null, table.name, null);
            var tableExists = resultSet.next();
            if (!tableExists) {
                createTable(table, connection);
            } else {
                updateTable(table, connection);
            }
        }
    }

    void createOrUpdateJoinTable(Table table) throws SQLException {
        try (var connection = getConnection()) {
            log.debug("Check if table {} exists ...", table.name);
            var resultSet = connection.getMetaData().getTables(null, null, table.name, null);
            var tableExists = resultSet.next();
            
            if (!tableExists) {
                createTable(table, connection);
                createIndexes(table, connection);
            } else {
                updateTable(table, connection);
            }
        }
    }

    private void updateTable(Table table, Connection connection) throws SQLException {
        var columnMetadata = getColumnMetadata(connection, table.name);
        var newColumns = table.columns.stream()
                .filter(column -> !column.type.isSet() && !columnMetadata.containsKey(column.name))
                .collect(Collectors.toList());
        try {
            log.debug("New columns: {}", new ObjectMapper().writeValueAsString(newColumns));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        // Update existing table
        if (!newColumns.isEmpty()) {
            connection.setAutoCommit(true);
            var command = newColumns.stream()
                    .map(column -> String.format("alter table %s add column %s %s",
                            table.name, column.name, databaseTypeForColumnType(column.type)))
                    .collect(Collectors.joining("; "));
            log.debug(command);
            connection.createStatement().execute(command);
            connection.setAutoCommit(false);
            log.info("Table {} updated.", table.name);
        }
    }

    private void createTable(Table table, Connection connection) throws SQLException {
        // Create new table
        connection.setAutoCommit(true);
        var columnSpecification = table.columns.stream()
                .filter(column -> !column.type.isSet())
                .map(column -> String.format("%s %s", column.name, databaseTypeForColumnType(column.type)))
                .collect(Collectors.joining(", "));
        var keys = table.columns.stream()
                .filter(column -> column.type == ColumnType.Identifier)
                .map(column -> column.name)
                .collect(Collectors.joining(", "));
        var command = String.format("create table %s ( %s, primary key ( %s ) )", table.name, columnSpecification,
                keys);
        log.debug(command);
        connection.createStatement().execute(command);
        connection.setAutoCommit(false);
        log.info("Table {} created.", table.name);
    }

    private void createIndexes(Table table, Connection connection) throws SQLException {
        
        var keys = table.columns.stream()
                .filter(column -> column.type == ColumnType.Identifier)
                .map(column -> column.name)
                .toList();

        connection.setAutoCommit(true);

        for (var column : keys) {
            var indexName = String.format("%1$s_%2$s_idx", table.name, column);
            var command = String.format("CREATE INDEX IF NOT EXISTS %3$s ON public.%1$s (%2$s)", table.name, column, indexName);

            log.debug(command);
            connection.createStatement().execute(command);
            log.info("Index {} created.", indexName);
        }
        
        connection.setAutoCommit(false);
    }

    void validateViewConfig(ViewsConfig.View view) {
        if (view.columns.stream().anyMatch(column -> column.name.equalsIgnoreCase("id"))) {
            throw new IllegalArgumentException(
                    "Forbidden to override the built-in column 'id' of view " + view.name);
        }
        if (view.columns.stream().anyMatch(column -> column.name.equalsIgnoreCase("label"))) {
            throw new IllegalArgumentException(
                    "Forbidden to override the built-in column 'label' of view " + view.name);
        }
        if (view.name.equalsIgnoreCase("resource") &&
                view.columns.stream().anyMatch(column -> column.name.equalsIgnoreCase("collection"))) {
            throw new IllegalArgumentException(
                    "Forbidden to override the built-in column 'collection' of view " + view.name);
        }
        if (!view.name.equalsIgnoreCase("resource") &&
                view.types.stream().anyMatch(protectedResources::contains)) {
            throw new IllegalArgumentException(
                    "Forbidden built-in type specified for view " + view.name);
        }
    }

    void createOrUpdateView(ViewsConfig.View view) throws SQLException {
        // Add view table
        validateViewConfig(view);
        var columns = new ArrayList<Table.ColumnDefinition>();
        columns.add(idColumn());
        columns.add(valueColumn("label", ColumnType.Text));
        if (view.name.equalsIgnoreCase("resource")) {
            columns.add(valueColumn("collection", ColumnType.Text));
        }
        for (var column : view.columns) {
            if (column.type.isSet()) {
                continue;
            }
            columns.add(valueColumn(column.name, column.type));
        }
        var table = Table.builder()
                .name(view.name.toLowerCase())
                .columns(columns)
                .build();
        createOrUpdateTable(table);
        configuration.viewTables.put(view.name, table);
        // Add property tables
        for (ViewsConfig.View.Column column : view.columns) {
            if (!column.type.isSet()) {
                continue;
            }
            var propertyTableColumns = new ArrayList<Table.ColumnDefinition>();
            propertyTableColumns.add(idColumn(view.name));
            propertyTableColumns.add(valueColumn(column.name, ColumnType.Identifier));
            var propertyTable = Table.builder()
                    .name(String.format("%s_%s", view.name.toLowerCase(), column.name.toLowerCase()))
                    .columns(propertyTableColumns)
                    .build();
            createOrUpdateTable(propertyTable);
            configuration.propertyTables.putIfAbsent(view.name, new HashMap<>());
            configuration.propertyTables.get(view.name).put(column.name, propertyTable);
        }
        if (view.join != null) {
            // Add join tables
            for (ViewsConfig.View.JoinView join : view.join) {
                var joinTable = getJoinTable(join, view);
                createOrUpdateJoinTable(joinTable);
                configuration.joinTables.putIfAbsent(view.name, new HashMap<>());
                configuration.joinTables.get(view.name).put(join.view, joinTable);
            }
        }
    }

    public static Table getJoinTable(View.JoinView join, View view) {
        String left = join.reverse ? join.view : view.name;
        String right = join.reverse ? view.name : join.view;
        var joinTable = Table.builder()
                .name(String.format("%s_%s", left.toLowerCase(), right.toLowerCase()))
                .columns(Arrays.asList(
                        idColumn(left),
                        idColumn(right)))
                .build();

        return joinTable;
    }

    @Data
    @Builder
    public static class ColumnMetadata {
        String type;
        Boolean nullable;
    }
}
