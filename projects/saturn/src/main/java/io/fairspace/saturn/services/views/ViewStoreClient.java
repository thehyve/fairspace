package io.fairspace.saturn.services.views;

import com.fasterxml.jackson.databind.*;
import io.fairspace.saturn.config.*;
import lombok.*;
import lombok.extern.slf4j.*;

import java.sql.*;
import java.util.*;
import java.util.stream.*;

import static io.fairspace.saturn.services.views.Table.idColumn;
import static io.fairspace.saturn.services.views.Table.valueColumn;

@Slf4j
public class ViewStoreClient {

    static final ObjectMapper MAPPER = new ObjectMapper();

    @SneakyThrows
    public static void setQueryValue(PreparedStatement query, int index, Object value) {
        if (value == null) {
            return;
        }
        if (value instanceof Number) {
            query.setFloat(index, ((Number) value).floatValue());
        } else if (value instanceof Collection) {
            query.setString(index, MAPPER.writeValueAsString(value));
        } else {
            query.setString(index, value.toString());
        }
    }

    @Getter
    final SearchConfig searchConfig;
    final Connection connection;
    final Map<String, Table> viewTables;
    final Map<String, Map<String, Table>> propertyTables;
    final Map<String, Map<String, Table>> joinTables;

    public ViewStoreClient(
            SearchConfig searchConfig,
            Connection connection,
            Map<String, Table> viewTables,
            Map<String, Map<String, Table>> propertyTables,
            Map<String, Map<String, Table>> joinTables) {
        this.searchConfig = searchConfig;
        this.connection = connection;
        this.viewTables = viewTables;
        this.propertyTables = propertyTables;
        this.joinTables = joinTables;
    }

    public void commit() throws SQLException {
        this.connection.commit();
    }

    public void deleteRow(String view, String uri) throws SQLException {
        var viewTable = viewTables.get(view);
        var query = connection.prepareStatement(
                "delete from " + viewTable.name + " where id = ?");
        query.setString(0, uri);
        var deletedCount = query.executeUpdate();
        query.close();
        log.debug("Deleted {} rows from view {}", deletedCount, view);
    }

    Set<String> retrieveValues(String joinTable, String view, String id, Table.ColumnDefinition column) throws SQLException {
        var query = connection.prepareStatement(
                "select " + column.name + " from " + joinTable +
                        " where " + idColumn(view).name + " = ?"
        );
        query.setString(1, id);
        var result = query.executeQuery();
        var links = new HashSet<String>();
        while (result.next()) {
            links.add(result.getString(1));
        }
        query.close();
        return links;
    }

    int deleteValues(
            Table table,
            Table.ColumnDefinition idColumn,
            String id,
            Table.ColumnDefinition valueColumn,
            Collection<String> values) throws SQLException {
        var deleteSql = "delete from " + table.name +
                " where " + idColumn.name + " = ? " +
                " and " + valueColumn.name + " = ?";
        PreparedStatement delete = connection.prepareStatement(deleteSql);
        var deleteCount = 0;
        for (String value: values) {
            if (!values.contains(value)) {
                delete.setString(1, id);
                delete.setString(2, value);
                deleteCount += delete.executeUpdate();
            }
        }
        delete.close();
        return deleteCount;
    }

    int insertValues(
            Table table,
            Table.ColumnDefinition idColumn,
            String id,
            Table.ColumnDefinition valueColumn,
            Collection<String> values) throws SQLException {
        var insertSql = "insert into " + table.name + " ( " +
                idColumn.name + ", " + valueColumn.name + " ) values ( ?, ? )";
        PreparedStatement insert = connection.prepareStatement(insertSql);
        int insertCount = 0;
        for (String value: values) {
            insert.setString(1, id);
            insert.setString(2, value);
            insertCount += insert.executeUpdate();
        }
        insert.close();
        return insertCount;
    }

    public void updateValues(String view, String id, String property, Set<String> values) throws SQLException {
        var propertyTable = propertyTables.get(view).get(property);
        var valueColumn = valueColumn(property, SearchConfig.ColumnType.Text);
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

        log.debug("Deleted {}, inserted {} values for {}.{}", deleteCount, insertCount, view, property);
    }

    public void updateLinks(String view, String id, String joinView, Set<String> links) throws SQLException {
        var joinTable = joinTables.get(view).get(joinView);
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
        var query = connection.prepareStatement(
                "select exists ( select 1 from " + table + " where id = ? )"
        );
        query.setString(1, id);
        var result = query.executeQuery();
        result.next();
        var exists = result.getBoolean(1);
        query.close();
        return exists;
    }

    String valueParameter(Table viewTable, String columnName) {
        var column = viewTable.getColumn(columnName);
        return column.getType() == SearchConfig.ColumnType.Set ? "cast(? as jsonb)" : "?";
    }

    public void updateRow(String view, Map<String, Object> row) throws SQLException {
        var viewTable = viewTables.get(view);
        var columnNames = new ArrayList<String>();
        var values = new ArrayList<>();
        row.forEach((key, value) -> {
            columnNames.add(key.toLowerCase());
            values.add(value);
        });
        var id = (String) row.get("id");
        var exists = rowExists(viewTable.name, id);

        String updateSql;
        if (exists) {
            updateSql = "update " + viewTable.name + " set " +
                    columnNames.stream().map(column -> column + " = " + valueParameter(viewTable, column)).collect(Collectors.joining(", ")) +
                    " where id = ?";
        } else {
            updateSql = "insert into " + viewTable.name + " ( " +
                    String.join(", ", columnNames) + " ) values ( " +
                    columnNames.stream().map(column -> valueParameter(viewTable, column)).collect(Collectors.joining(", ")) + " )";
        }
        PreparedStatement update = connection.prepareStatement(updateSql);
        for (var i=0; i < values.size(); i++) {
            var value = values.get(i);
            setQueryValue(update, i + 1, value);
        }
        if (exists) {
            update.setString(values.size() + 1, id);
        }
        var updateCount = update.executeUpdate();
        update.close();
        if (exists) {
            log.debug("Updated {} row of view {}", updateCount, view);
        } else {
            log.debug("Inserted {} row into view {}", updateCount, view);
        }
    }

    Map<String, Object> transformRow(SearchConfig.View viewConfig, ResultSet result) throws SQLException {
        Map<String, Object> row = new HashMap<>();
        for (var viewColumn: viewConfig.columns) {
            var column = viewTables.get(viewConfig.name).getColumns().stream().filter(c -> c.getName().equals(viewColumn.name.toLowerCase())).findFirst().orElseThrow();
            var value = switch(column.type) {
                case Number -> result.getFloat(column.name);
                default -> result.getString(column.name);
            };
            row.put(viewColumn.name, value);
        }
        return row;
    }

    String sqlFilter(List<ViewRequest.Filter> filters, List<Object> values) {
        if (filters == null || filters.isEmpty()) {
            return "";
        }
        return filters.stream()
                .map(filter -> {
                    if (filter.getValues() != null && !filter.getValues().isEmpty()) {
                        return String.format("%s in ( %s )",
                                filter.getField().toLowerCase(),
                                filter.getValues().stream().map(value -> {
                                    values.add(value);
                                    return "?";
                                })
                                .collect(Collectors.joining(", ")));
                    }
                    var constraints = new ArrayList<String>();
                    if (filter.getRangeStart() != null) {
                        values.add(filter.getRangeStart());
                        constraints.add(filter.getField().toLowerCase() + " >= ?");
                    }
                    if (filter.getRangeEnd() != null) {
                        values.add(filter.getRangeEnd());
                        constraints.add(filter.getField().toLowerCase() + " <= ?");
                    }
                    if (!constraints.isEmpty()) {
                        return String.join(" and ", constraints);
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" and "));
    }

    PreparedStatement query(String view, String projection, List<ViewRequest.Filter> filters, String scope) throws SQLException {
        var viewTable = viewTables.get(view);
        var values = new ArrayList<>();
        var constraints = sqlFilter(filters, values);
        var query = connection.prepareStatement(
                "select " + projection +
                        " from " + viewTable.name +
                        (constraints.isBlank() ? "" : " where " + constraints) +
                        (scope == null ? "" : (" " + scope))
        );
        for (var i=0; i < values.size(); i++) {
            var value = values.get(i);
            if (value instanceof Number) {
                query.setFloat(i + 1, ((Number)value).floatValue());
            } else {
                query.setString(i + 1, value.toString());
            }
        }
        return query;
    }

    public List<Map<String, Object>> retrieveRows(String view, List<ViewRequest.Filter> filters, int offset, int limit) throws SQLException {
        var viewConfig = searchConfig.views.stream().filter(v -> v.name.equals(view)).findFirst().orElseThrow();
        var q = query(view, "*", filters, String.format("offset %d limit %d", offset, limit));
        var result = q.executeQuery();
        List<Map<String, Object>> rows = new ArrayList<>();
        while (result.next()) {
            rows.add(transformRow(viewConfig, result));
        }
        q.close();
        return rows;
    }

    public int countRows(String view, List<ViewRequest.Filter> filters) throws SQLException {
        var q = query(view, "count(*) as rowCount", filters, null);
        var result = q.executeQuery();
        result.next();
        var rowCount = result.getInt("rowCount");
        q.close();
        return rowCount;
    }
}
