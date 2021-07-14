package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.config.ViewsConfig.*;
import io.fairspace.saturn.services.views.Table.*;
import lombok.*;
import lombok.extern.slf4j.*;

import java.sql.*;
import java.sql.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

import static io.fairspace.saturn.services.views.Table.idColumn;
import static io.fairspace.saturn.services.views.Table.valueColumn;

@Slf4j
public class ViewStoreClient {

    public static class ViewStoreConfiguration {
        final Map<String, View> viewConfig;
        final Map<String, Table> viewTables = new HashMap<>();
        final Map<String, Map<String, Table>> propertyTables = new HashMap<>();
        final Map<String, Map<String, Table>> joinTables = new HashMap<>();

        ViewStoreConfiguration(ViewsConfig viewsConfig) {
            viewConfig = viewsConfig.views.stream().collect(Collectors.toMap(view -> view.name, Function.identity()));
        }
    }

    @SneakyThrows
    public static void setQueryValue(PreparedStatement query, int index, Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Unexpected null value.");
        }
        if (value instanceof Number) {
            query.setFloat(index, ((Number) value).floatValue());
        } else if (value instanceof Instant) {
            query.setTimestamp(index, Timestamp.from((Instant) value));
        } else if (value instanceof Collection) {
            throw new IllegalArgumentException("Unexpected value of collection type.");
        } else {
            query.setString(index, value.toString());
        }
    }

    public final Connection connection;
    final ViewStoreConfiguration configuration;

    public ViewStoreClient(
            Connection connection,
            ViewStoreConfiguration configuration) {
        this.connection = connection;
        this.configuration = configuration;
    }

    public void commit() throws SQLException {
        this.connection.commit();
    }

    public void deleteRow(String view, String uri) throws SQLException {
        var viewTable = configuration.viewTables.get(view);
        try (var query = connection.prepareStatement(
                "delete from " + viewTable.name + " where id = ?")) {
            query.setString(1, uri);
            var deletedCount = query.executeUpdate();
            log.debug("Deleted {} rows from view {}", deletedCount, view);
        }
    }

    Set<String> retrieveValues(String joinTable, String view, String id, ColumnDefinition column) throws SQLException {
        try (var query = connection.prepareStatement(
                "select " + column.name + " from " + joinTable +
                        " where " + idColumn(view).name + " = ?"
        )) {
            query.setString(1, id);
            var result = query.executeQuery();
            var links = new HashSet<String>();
            while (result.next()) {
                links.add(result.getString(1));
            }
            return links;
        }
    }

    int deleteValues(
            Table table,
            ColumnDefinition idColumn,
            String id,
            ColumnDefinition valueColumn,
            Collection<String> values) throws SQLException {
        var deleteSql = "delete from " + table.name +
                " where " + idColumn.name + " = ? " +
                " and " + valueColumn.name + " = ?";
        try (var delete = connection.prepareStatement(deleteSql)) {
            for (String value : values) {
                delete.setString(1, id);
                delete.setString(2, value);
                delete.addBatch();
            }
            return Arrays.stream(delete.executeBatch()).sum();
        }
    }

    int insertValues(
            Table table,
            ColumnDefinition idColumn,
            String id,
            ColumnDefinition valueColumn,
            Collection<String> values) throws SQLException {
        var insertSql = "insert into " + table.name + " ( " +
                idColumn.name + ", " + valueColumn.name + " ) values ( ?, ? )";
        try (var insert = connection.prepareStatement(insertSql)) {
            for (String value : values) {
                insert.setString(1, id);
                insert.setString(2, value);
                insert.addBatch();
            }
            return Arrays.stream(insert.executeBatch()).sum();
        }
    }

    public void updateValues(String view, String id, String property, Set<String> values) throws SQLException {
        var propertyTable = configuration.propertyTables.get(view).get(property);
        var valueColumn = valueColumn(property, ColumnType.Text);
        var existing = retrieveValues(propertyTable.name, view, id, valueColumn);

        var deleteCount = deleteValues(
                propertyTable,
                idColumn(view),
                id,
                valueColumn,
                existing.stream().filter(value -> !values.contains(value)).collect(Collectors.toList()));

        var insertCount = insertValues(
                propertyTable,
                idColumn(view),
                id,
                valueColumn,
                values.stream().filter(value -> !existing.contains(value)).collect(Collectors.toList()));

        log.debug("Deleted {}, inserted {} values for {}_{}", deleteCount, insertCount, view, property);
    }

    public void updateLinks(String view, String id, String joinView, Set<String> links) throws SQLException {
        var joinTable = configuration.joinTables.get(view).get(joinView);
        var existing = retrieveValues(joinTable.name, view, id, idColumn(joinView));

        var deleteCount = deleteValues(
                joinTable,
                idColumn(view),
                id,
                idColumn(joinView),
                existing.stream().filter(link -> !links.contains(link)).collect(Collectors.toList()));

        var insertCount = insertValues(
                joinTable,
                idColumn(view),
                id,
                idColumn(joinView),
                links.stream().filter(link -> !existing.contains(link)).collect(Collectors.toList()));

        log.debug("Deleted {}, inserted {} links for {} - {}", deleteCount, insertCount, view, joinView);
    }

    boolean rowExists(String table, String id) throws SQLException {
        try (var query = connection.prepareStatement(
                "select exists ( select 1 from " + table + " where id = ? )"
        )) {
            query.setString(1, id);
            var result = query.executeQuery();
            result.next();
            return result.getBoolean(1);
        }
    }

    public void addLabel(String id, String type, String label) throws SQLException {
        if (!rowExists("label", id)) {
            try (var insert = connection.prepareStatement("insert into label (id, type, label) values (?, ?, ?)")) {
                insert.setString(1, id);
                insert.setString(2, type);
                insert.setString(3, label);
                insert.executeUpdate();
                log.debug("Inserted label '{}' for {} (type {})", label, id, type);
            }
        }
    }

    public void updateRow(String view, Map<String, Object> row) throws SQLException {
        var viewTable = configuration.viewTables.get(view);
        var config = configuration.viewConfig.get(view);
        var columnNames = new ArrayList<String>();
        var values = new ArrayList<>();
        row.forEach((key, value) -> {
            if (value == null) {
                return;
            }
            var columnName = key.toLowerCase();
            if (config.columns.stream().anyMatch(column ->
                    column.name.equalsIgnoreCase(columnName) && column.type.isSet())) {
                // Skip value set columns
                return;
            }
            columnNames.add(columnName);
            values.add(value);
        });
        var id = (String) row.get("id");
        var exists = rowExists(viewTable.name, id);

        String updateSql;
        if (exists) {
            updateSql = "update " + viewTable.name + " set " +
                    columnNames.stream()
                            .map(column -> column + " = ?")
                            .collect(Collectors.joining(", ")) +
                    " where id = ?";
        } else {
            updateSql = "insert into " + viewTable.name + " ( " +
                    String.join(", ", columnNames) + " ) values ( " +
                    columnNames.stream()
                            .map(column -> "?")
                            .collect(Collectors.joining(", ")) + " )";
        }
        try (var update = connection.prepareStatement(updateSql)) {
            for (var i = 0; i < values.size(); i++) {
                var value = values.get(i);
                setQueryValue(update, i + 1, value);
            }
            if (exists) {
                update.setString(values.size() + 1, id);
            }
            var updateCount = update.executeUpdate();
            if (exists) {
                log.debug("Updated {} rows of view {}", updateCount, view);
            } else {
                log.debug("Inserted {} rows into view {}", updateCount, view);
            }
        }
    }

    public void truncateTable(String tableName) throws SQLException {
        // rollback() is a workaround in case a previous transaction is still open.
        // Discuss solution, rollback at any place in code where a SQLException is caught,
        // or have every API request get a new connection. At this moment connection behaves like a singleton.
        // Is it ever tested what happens with 2 parallel requests?
        connection.rollback();

        var query = "truncate table " + tableName;
        PreparedStatement statement = connection.prepareStatement(query);
        int result = statement.executeUpdate();
        connection.commit();
        statement.close();
    }

    public int insertValues(
            String tableName,
            List<String> columnNames,
            ViewsConfig.ColumnType[] columnTypes,
            List<String[]> rows) {
        if (rows.size() == 0) {
            return 0;
        }

        var placeHolders = columnNames
                .stream()
                .map(v -> "?")
                .toArray(String[]::new);

        String query = "insert into " + tableName.toLowerCase() + " (" + String.join(", ", columnNames) +
                ") VALUES (" + String.join(", ", placeHolders) + ")";

        try {
            var insert = connection.prepareStatement(query);

            for (var row : rows) {
                addRowValues(insert, row, columnTypes);
            }

            var result = insert.executeBatch();
            connection.commit();
            insert.close();
            return rows.size();
        } catch (SQLException e) {
            log.error("error with insert batch", e);
            throw new RuntimeException(e);
        }
    }

    @SneakyThrows
    private void addRowValues(PreparedStatement insert, String[] row, ColumnType[] columnTypes) throws SQLException {
        for (int i = 0; i < row.length; i++) {
            if (row[i] == null) {
                insert.setNull(i + 1, Types.NULL);
                continue;
            }

            switch (columnTypes[i]) {
                case Identifier:
                case Term:
                case Text:
                    insert.setString(i + 1, row[i]);
                    break;
                case TermSet:
                    break;
                case Number:
                    insert.setDouble(i + 1, Double.parseDouble(row[i].replaceAll("'", "")));
                    break;
                case Date:
                    var dateString = row[i].replaceAll("'", "");

                    DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                            .appendPattern("yyyy-MM-dd'T'HH:mm:ss")
                            .appendFraction(ChronoField.MICRO_OF_SECOND, 0, 6, true)
                            .appendPattern("'Z'")
                            .toFormatter();

                    LocalDateTime dateTime = LocalDateTime.parse(dateString, formatter);
                    insert.setTimestamp(i + 1, java.sql.Timestamp.valueOf(dateTime));
                    break;
                default:
                    throw new IllegalStateException("Unexpected value: " + columnTypes[i]);
            }
        }
        insert.addBatch();
    }
}
