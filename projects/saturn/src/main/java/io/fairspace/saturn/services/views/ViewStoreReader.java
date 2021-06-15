package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.config.ViewsConfig.*;
import io.fairspace.saturn.services.search.FileSearchRequest;
import io.fairspace.saturn.services.search.SearchResultDTO;
import io.fairspace.saturn.services.search.SearchResultsDTO;
import lombok.SneakyThrows;
import lombok.extern.slf4j.*;
import org.apache.commons.lang3.StringUtils;

import java.sql.*;
import java.time.*;
import java.util.*;
import java.util.Date;
import java.util.stream.*;

import static io.fairspace.saturn.config.ViewsConfig.ColumnType.Date;
import static io.fairspace.saturn.services.views.Table.idColumn;

/**
 * Executes SQL queries via JDBC on the view database
 * to obtain row data or aggregate data for a specified view
 * while applying specified filters.
 * Access to collections is not checked here. Restricting results
 * to only allowed collections can be achieved by providing these
 * collections in a filter with 'Resource_collection' as field.
 */
@Slf4j
public class ViewStoreReader {
    final Config.Search searchConfig;
    final ViewStoreClient.ViewStoreConfiguration configuration;
    final Connection connection;

    public ViewStoreReader(Config.Search searchConfig, ViewStoreClient viewStoreClient) {
        this.searchConfig = searchConfig;
        this.configuration = viewStoreClient.configuration;
        this.connection = viewStoreClient.connection;
    }

    String label(String id) throws SQLException {
        try (var query = connection.prepareStatement(
                "select label from label where id = ?")) {
            query.setString(1, id);
            var result = query.executeQuery();
            if (result.next()) {
                return result.getString("label");
            }
        }
        return null;
    }

    String iriForLabel(String type, String label) throws SQLException {
        try (var query = connection.prepareStatement(
                "select id from label where type = ? and label = ?")) {
            query.setString(1, type);
            query.setString(2, label);
            var result = query.executeQuery();
            if (result.next()) {
                return result.getString("id");
            }
        }
        return null;
    }

    Map<String, Set<ValueDTO>> transformRow(View viewConfig, ResultSet result) throws SQLException {
        Map<String, Set<ValueDTO>> row = new HashMap<>();
        row.put(viewConfig.name, Collections.singleton(new ValueDTO(result.getString("label"), result.getString("id"))));
        if (viewConfig.name.equalsIgnoreCase("Collection")) {
            var collection = result.getString("collection");
            row.put(viewConfig.name + "_collection", Collections.singleton(new ValueDTO(collection, collection)));
        }
        for (var viewColumn : viewConfig.columns) {
            if (viewColumn.type.isSet()) {
                continue;
            }
            var column = configuration.viewTables.get(viewConfig.name).getColumns().stream()
                    .filter(c -> c.getName().equals(viewColumn.name.toLowerCase()))
                    .findFirst().orElseThrow();
            var columnName = viewConfig.name + "_" + viewColumn.name;
            if (column.type == ColumnType.Number) {
                var value = result.getBigDecimal(column.name);
                if (value != null) {
                    row.put(columnName, Collections.singleton(new ValueDTO(value.toString(), value.floatValue())));
                }
            } else if (column.type == Date) {
                var value = result.getTimestamp(column.name);
                if (value != null) {
                    row.put(columnName, Collections.singleton(new ValueDTO(value.toInstant().toString(), value.toInstant())));
                }
            } else {
                var value = result.getString(column.name);
                if (viewColumn.type == ColumnType.Term) {
                    row.put(columnName, Collections.singleton(new ValueDTO(value, iriForLabel(viewColumn.rdfType, value))));
                } else {
                    row.put(columnName, Collections.singleton(new ValueDTO(value, value)));
                }
            }
        }
        return row;
    }

    View.Column checkField(String field) {
        if (field.equalsIgnoreCase("Resource_collection")) {
            return null;
        }
        if (field.equalsIgnoreCase("Resource")) {
            return null;
        }
        var fieldNameParts = field.split("_");
        if (fieldNameParts.length > 2) {
            throw new IllegalArgumentException("Invalid field: " + field);
        }
        var config = configuration.viewConfig.get(fieldNameParts[0]);
        if (config == null) {
            throw new IllegalArgumentException("Unknown view name: " + fieldNameParts[0]);
        }
        if (fieldNameParts.length == 1) {
            return null;
        }
        var viewColumn = config.columns.stream()
                .filter(column -> column.name.equalsIgnoreCase(fieldNameParts[1]))
                .findFirst().orElse(null);
        if (viewColumn == null) {
            log.error("Unknown column for view {}: {}", fieldNameParts[0], fieldNameParts[1]);
            log.error("Expected one of {}", config.columns.stream().map(column -> column.name).collect(Collectors.joining(", ")));
            throw new IllegalArgumentException(
                    "Unknown column for view " + fieldNameParts[0] + ": " + fieldNameParts[1]);
        }
        return viewColumn;
    }

    void prepareFilters(List<ViewFilter> filters) throws SQLException {
        for (var filter : filters) {
            if (filter.getField().equalsIgnoreCase("location")) {
                filter.setField("Resource");
                filter.setPrefixes(filter.values.stream().map(Object::toString).collect(Collectors.toList()));
                filter.setValues(null);
            }
            var column = checkField(filter.getField());
            if (column == null) {
                continue;
            }
            if (EnumSet.of(ColumnType.Term, ColumnType.TermSet).contains(column.type)) {
                var values = new ArrayList<>();
                for (var value : filter.values) {
                    var label = label(value.toString());
                    if (label == null) {
                        log.error("No label found for value " + value.toString());
                        // throw new IllegalStateException("No label found for value " + value.toString());
                        continue;
                    }
                    values.add(label);
                }
                filter.values = values;
            } else if (column.type == Date) {
                if (filter.min != null) {
                    filter.min = Instant.parse(filter.min.toString());
                }
                if (filter.max != null) {
                    filter.max = Instant.parse(filter.max.toString());
                }
            }
        }
    }

    String escapeLikeString(String value) {
        return value
                .replaceAll("\\[", "\\[")
                .replaceAll("]", "\\]")
                .replaceAll("_", "\\_")
                .replaceAll("%", "\\%")
                .replaceAll("\\\\", "\\\\");
    }

    String sqlConstraint(String fieldName, ViewFilter filter, List<Object> values) {
        if (fieldName.isBlank()) {
            fieldName = "id";
        }
        if (filter.getValues() != null && !filter.getValues().isEmpty()) {
            if (filter.getValues().size() == 1) {
                values.add(filter.getValues().get(0));
                return String.format("%s = ?", fieldName);
            }
            return String.format("%s in ( %s )",
                    fieldName,
                    filter.getValues().stream()
                            .map(value -> {
                                values.add(value);
                                return "?";
                            })
                            .collect(Collectors.joining(", ")));
        }
        var constraints = new ArrayList<String>();
        if (filter.getMin() != null) {
            values.add(filter.getMin());
            constraints.add(fieldName + " >= ?");
        }
        if (filter.getMax() != null) {
            values.add(filter.getMax());
            constraints.add(fieldName + " <= ?");
        }
        if (filter.getPrefix() != null && !filter.getPrefix().isBlank()) {
            // Use view label instead of id for prefix filters
            String prefixFieldName = fieldName;
            if (prefixFieldName.endsWith(".id")) {
                prefixFieldName = prefixFieldName.replaceAll("\\.id$", ".label");
            }
            values.add(escapeLikeString(filter.getPrefix().trim().toLowerCase()) + "%");
            constraints.add(prefixFieldName + " ilike ? escape '\\'");
        }
        if (filter.getPrefixes() != null && !filter.getPrefixes().isEmpty()) {
            String finalFieldName = fieldName;
            var prefixes = filter.getPrefixes().stream().map(prefix -> {
                values.add(escapeLikeString(prefix) + "%");
                return finalFieldName + " like ? escape '\\'";
            }).collect(Collectors.joining(" or "));
            constraints.add("(" + prefixes + ")");
        }
        if (!constraints.isEmpty()) {
            return String.join(" and ", constraints);
        }
        return null;
    }

    String sqlFilter(String alias, View view, List<ViewFilter> filters, List<Object> values) {
        if (filters == null || filters.isEmpty()) {
            return "";
        }
        return filters.stream()
                .map(filter -> {
                    var field = filter.getField().equalsIgnoreCase(view.name)
                            ? "id"
                            : filter.getField().split("_")[1].toLowerCase();
                    var column = view.columns.stream()
                            .filter(c -> c.name.equalsIgnoreCase(field))
                            .findFirst().orElse(null);
                    if (column != null && column.type.isSet()) {
                        var propertyTable = configuration.propertyTables.get(view.name).get(column.name);
                        var subConstraint = sqlConstraint("pt." + field, filter, values);
                        return "exists (select *" +
                                " from " + propertyTable.name + " pt " +
                                " where pt." + idColumn(view.name).name + " = " + alias + ".id" +
                                (subConstraint.isBlank() ? "" : " and " + subConstraint) +
                                ")";
                    }
                    return sqlConstraint(alias + "." + field, filter, values);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" and "));
    }

    PreparedStatement query(String view, String projection, List<ViewFilter> filters, String scope) throws SQLException {
        if (filters == null) {
            filters = Collections.emptyList();
        }
        prepareFilters(filters);
        var filtersByView = filters.stream().collect(Collectors.groupingBy(
                filter -> filter.getField().split("_")[0]
        ));
        var values = new ArrayList<>();
        var constraints = sqlFilter("v", configuration.viewConfig.get(view), filtersByView.get(view), values);
        var subqueries = filtersByView.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(view))
                .map(entry -> {
                    var subView = entry.getKey();
                    var subConstraints = sqlFilter("jv", configuration.viewConfig.get(subView), entry.getValue(), values);
                    var subViewTable = configuration.viewTables.get(subView);
                    var joinTable = configuration.joinTables.get(view).get(subView);
                    return "exists (select *" +
                            " from " + joinTable.name + " jt " +
                            " join " + subViewTable.name + " jv " +
                            " on jv.id = jt." + idColumn(subView).name +
                            " where jt." + idColumn(view).name + " = v.id" +
                            (subConstraints.isBlank() ? "" : " and " + subConstraints) +
                            ")";
                })
                .collect(Collectors.toList());
        constraints = Stream.concat(
                Stream.of(constraints),
                subqueries.stream())
                .filter(constraint -> constraint != null && !constraint.isBlank())
                .collect(Collectors.joining(" and "));

        var viewTable = configuration.viewTables.get(view);
        var query = connection.prepareStatement(
                "select " + projection +
                        " from " + viewTable.name + " v " +
                        (constraints.isBlank() ? "" : " where " + constraints) +
                        (scope == null ? "" : (" " + scope))
        );
        for (var i = 0; i < values.size(); i++) {
            var value = values.get(i);
            if (value instanceof Number) {
                query.setFloat(i + 1, ((Number) value).floatValue());
            } else if (value instanceof Instant) {
                query.setTimestamp(i + 1, Timestamp.from((Instant) value));
            } else {
                query.setString(i + 1, value.toString());
            }
        }
        log.debug("Query: {}", query.toString());
        return query;
    }

    Map<String, PreparedStatement> prepareValueSetQueries(String view, List<String> properties) throws SQLException {
        var valueSetQueries = new LinkedHashMap<String, PreparedStatement>();
        for (var propertyName : properties) {
            var propertyTable = configuration.propertyTables.get(view).get(propertyName);
            var valueSetQuery = connection.prepareStatement(
                    "select " + propertyName.toLowerCase() +
                            " from " + propertyTable.name + " p " +
                            " where p." + idColumn(view).name + " = ?");
            valueSetQueries.put(propertyName, valueSetQuery);
        }
        return valueSetQueries;
    }

    void addValueSetValues(String view, Map<String, Set<ValueDTO>> row, List<String> properties, Map<String, PreparedStatement> valueSetQueries) throws SQLException {
        var rowId = (String) row.get(view).stream().findFirst().orElseThrow().getValue();
        for (var propertyName : properties) {
            var valueSetQuery = valueSetQueries.get(propertyName);
            valueSetQuery.setString(1, rowId);
            var valueSetResult = valueSetQuery.executeQuery();
            var values = new LinkedHashSet<ValueDTO>();
            while (valueSetResult.next()) {
                var label = valueSetResult.getString(propertyName.toLowerCase());
                values.add(new ValueDTO(label, label));
            }
            row.put(view + "_" + propertyName, values);
        }
    }

    List<Map<String, Set<ValueDTO>>> retrieveViewTableRows(
            String view, List<ViewFilter> filters, int offset, int limit) throws SQLException {
        var viewConfig = configuration.viewConfig.get(view);
        if (viewConfig == null) {
            throw new IllegalArgumentException("View not supported: " + view);
        }
        var valueSetProperties = viewConfig.columns.stream()
                .filter(column -> column.type.isSet())
                .map(column -> column.name)
                .collect(Collectors.toList());
        var valueSetQueries = prepareValueSetQueries(view, valueSetProperties);
        var start = new Date().getTime();
        try (var query = query(view, "*", filters,
                String.format("order by id %s limit %d", offset > 0 ? String.format("offset %d", offset) : "", limit))) {
            query.setQueryTimeout((int) searchConfig.pageRequestTimeout);
            var result = query.executeQuery();
            log.debug("Query took {} ms", new Date().getTime() - start);
            var mid = new Date().getTime();
            List<Map<String, Set<ValueDTO>>> rows = new ArrayList<>();
            while (result.next()) {
                var row = transformRow(viewConfig, result);
                addValueSetValues(view, row, valueSetProperties, valueSetQueries);
                rows.add(row);
            }
            log.debug("Processing rows + querying value sets took {} ms", new Date().getTime() - mid);
            return rows;
        } finally {
            for (var q : valueSetQueries.values()) {
                q.close();
            }
            log.debug("Complete process took {} ms", new Date().getTime() - start);
        }
    }

    List<Map<String, Set<ValueDTO>>> retrieveJoinTableRows(
            String view, View.JoinView joinView, String id) throws SQLException {
        var joinedTable = configuration.viewTables.get(joinView.view);
        var joinViewConfig = configuration.viewConfig.get(joinView.view);
        var valueSetProperties = joinViewConfig.columns.stream()
                .filter(column -> column.type.isSet())
                .map(column -> column.name)
                .filter(joinView.include::contains)
                .collect(Collectors.toList());
        var valueSetQueries = prepareValueSetQueries(joinView.view, valueSetProperties);
        var joinTable = configuration.joinTables.get(view).get(joinView.view);
        var projectionColumns = Stream.concat(
                Stream.of("id", "label"),
                joinView.include.stream()
                        .filter(column -> !valueSetProperties.contains(column)))
                .collect(Collectors.toList());
        var query = connection.prepareStatement(
                "select " + projectionColumns.stream().map(String::toLowerCase).collect(Collectors.joining(", ")) +
                        " from " + joinedTable.name + " j " +
                        " where exists (" +
                        "   select * from " + joinTable.name + " jt " +
                        "   where jt." + idColumn(joinView.view).name + " = j.id" +
                        "   and jt." + idColumn(view).name + " = ? )"
        );
        query.setString(1, id);
        var result = query.executeQuery();
        List<Map<String, Set<ValueDTO>>> rows = new ArrayList<>();
        while (result.next()) {
            Map<String, Set<ValueDTO>> row = new HashMap<>();
            row.put(joinView.view, Collections.singleton(new ValueDTO(result.getString("label"), result.getString("id"))));
            for (var column : projectionColumns) {
                var columnName = joinView.view + "_" + column;
                var columnDefinition = configuration.viewTables.get(joinView.view).getColumns().stream()
                        .filter(c -> c.getName().equalsIgnoreCase(column))
                        .findFirst().orElseThrow(() -> {
                            throw new NoSuchElementException("Cannot find column " + column);
                        });
                if (columnDefinition.type == ColumnType.Number) {
                    var value = result.getBigDecimal(columnDefinition.name);
                    if (value != null) {
                        row.put(columnName, Collections.singleton(new ValueDTO(value.toString(), value)));
                    }
                } else if (columnDefinition.type == Date) {
                    var value = result.getTimestamp(columnDefinition.name);
                    if (value != null) {
                        row.put(columnName, Collections.singleton(new ValueDTO(value.toInstant().toString(), value.toString())));
                    }
                } else {
                    var label = result.getString(columnDefinition.name);
                    row.put(columnName, Collections.singleton(new ValueDTO(label, label)));
                }
            }
            addValueSetValues(joinView.view, row, valueSetProperties, valueSetQueries);
            rows.add(row);
        }
        for (var q : valueSetQueries.values()) {
            q.close();
        }
        query.close();
        return rows;
    }

    /**
     * Compute the range of numerical or date values in a column of a view.
     *
     * @param view   the view name.
     * @param column the column name.
     * @return a range object containing the minimum and maximum values.
     */
    public Range aggregate(String view, String column) {
        var viewConfig = configuration.viewConfig.get(view);
        if (viewConfig == null) {
            throw new IllegalArgumentException("View not supported: " + view);
        }
        var table = configuration.viewTables.get(view);
        var columnDefinition = table.getColumns().stream()
                .filter(c -> c.getName().equalsIgnoreCase(column))
                .findFirst().orElseThrow(() -> {
                    throw new NoSuchElementException("Cannot find column " + column);
                });
        if (!EnumSet.of(Date, ColumnType.Number).contains(columnDefinition.type)) {
            throw new IllegalArgumentException("Aggregation only supported for numerical and date columns");
        }
        try (PreparedStatement query = connection.prepareStatement(
                "select min(" + columnDefinition.name + ") as min, max(" + columnDefinition.name + ") as max" +
                        " from " + table.name
        )) {
            var result = query.executeQuery();
            if (!result.next()) {
                return null;
            }
            Object min;
            Object max;
            if (columnDefinition.type == Date) {
                min = result.getTimestamp("min");
                max = result.getTimestamp("max");
            } else {
                min = result.getBigDecimal("min");
                max = result.getBigDecimal("max");
            }
            return new Range(min, max);
        } catch (SQLException e) {
            throw new QueryException("Error aggregating column values", e);
        }
    }

    /**
     * Reads rows from a view table after applying the specified filters.
     * A row is represented as a map from column name to the set of values,
     * as there may be multiple values in a cell.
     *
     * @param view               the name of the view.
     * @param filters            the filters to apply.
     * @param offset             the index (zero-based) of the first row to include (for pagination)
     * @param limit              the maximum number of results to return.
     * @param includeJoinedViews if true, include joined views in the resulting rows.
     * @return the list of rows.
     * @throws SQLException
     */
    public List<Map<String, Set<ValueDTO>>> retrieveRows(
            String view, List<ViewFilter> filters,
            int offset,
            int limit,
            boolean includeJoinedViews
    ) throws SQLTimeoutException {
        try {
            var viewConfig = configuration.viewConfig.get(view);
            if (viewConfig == null) {
                throw new IllegalArgumentException("View not supported: " + view);
            }
            // Fetch rows with columns from the view table
            var rows = this.retrieveViewTableRows(view, filters, offset, limit);
            // Add items from join tables
            if (includeJoinedViews) {
                for (var joinView : viewConfig.join) {
                    for (var row : rows) {
                        var id = (String) row.get(view).stream().findFirst().orElseThrow().getValue();
                        for (var joinTableRow : this.retrieveJoinTableRows(view, joinView, id)) {
                            joinTableRow.forEach((key, values) -> {
                                if (!row.containsKey(key)) {
                                    row.put(key, new LinkedHashSet<>());
                                }
                                row.get(key).addAll(values);
                            });
                        }
                    }
                }
            }
            return rows;
        } catch (SQLTimeoutException e) {
            throw e;
        } catch (SQLException e) {
            throw new QueryException("Error retrieving page rows", e);
        }
    }

    /**
     * @param view
     * @param filters
     * @return
     * @throws SQLTimeoutException
     */
    public long countRows(String view, List<ViewFilter> filters) throws SQLTimeoutException {
        try (var q = query(view, "count(*) as rowCount", filters, null)) {
            q.setQueryTimeout((int) searchConfig.countRequestTimeout);
            var result = q.executeQuery();
            result.next();
            return result.getLong("rowCount");
        } catch (SQLTimeoutException e) {
            throw e;
        } catch (SQLException e) {
            throw new QueryException("Error counting rows", e);
        }
    }

    public List<SearchResultDTO> searchFiles(FileSearchRequest request, List<String> userCollections) {
        if (userCollections == null || userCollections.isEmpty()) {
            return Collections.emptyList();
        }

        var searchString = "%" + escapeLikeString(request.getQuery().toLowerCase()) + "%";

        ArrayList<String> values = new ArrayList<String>();
        values.add(searchString);
        values.add(searchString);
        values.addAll(userCollections);

        var collectionPlaceholders = userCollections
                .stream()
                .map(uc -> "?")
                .collect(Collectors.toList());
        var collectionConstraint = "and collection in (" + String.join(", ",collectionPlaceholders) + ") ";

        var idConstraint = StringUtils.isBlank(request.getParentIRI()) ? "" :
                "and id like '" + escapeLikeString(request.getParentIRI()) + "%' ";

        var queryString = new StringBuilder()
                .append("select id, label, description, type FROM resource ")
                .append("where (lower(label) like ? OR lower(description) like ?) ")
                .append(collectionConstraint)
                .append(idConstraint)
                .append("order by id asc limit 1000");

        try (var statement = connection.prepareStatement(queryString.toString())) {
            AddParameters(statement, values);
            statement.setQueryTimeout((int) searchConfig.pageRequestTimeout);

            var result = statement.executeQuery();
            return convertResult(result);

        } catch (SQLException e) {
            log.error("Error searching files.", e);
            throw new RuntimeException("Error searching files.", e); // Terminates Saturn
        }
    }

    @SneakyThrows
    private void AddParameters(PreparedStatement statement, List<String> values) {
        for(int i = 0; i< values.size(); i++) {
            statement.setString(i + 1, values.get(i));
        }
    }

    @SneakyThrows
    private List<SearchResultDTO> convertResult(ResultSet resultSet) {
        var rows = new ArrayList<SearchResultDTO>();
        while (resultSet.next()) {
            var row = SearchResultDTO.builder()
                    .id(resultSet.getString("id"))
                    .label(resultSet.getString("label"))
                    .type(resultSet.getString("type"))
                    .comment(resultSet.getString("description"))
                    .build();

            rows.add(row);
        }
        return rows;
    }


}
