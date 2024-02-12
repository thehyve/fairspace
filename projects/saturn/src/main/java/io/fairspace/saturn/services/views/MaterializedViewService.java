package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.ViewsConfig;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;

@Slf4j
public class MaterializedViewService  {

    public static final String INDEX_POSTFIX = "_idx";
    private final DataSource dataSource;

    final ViewStoreClient.ViewStoreConfiguration configuration;

    public MaterializedViewService(DataSource dataSource, ViewStoreClient.ViewStoreConfiguration configuration) {
        this.dataSource = dataSource;
        this.configuration = configuration;
    }

    public void createOrUpdateAllMaterializedViews() {
        try (var connection = dataSource.getConnection()) {
            for (var view : VIEWS_CONFIG.views) {
                createOrUpdateViewMaterializedView(view, connection);
                createOrUpdateJoinMaterializedView(view, connection);
            }
        } catch (SQLException e) {
            log.error("Materialized view update failed", e);
            throw new RuntimeException(e);
        }
    }

    public void createOrUpdateViewMaterializedView(ViewsConfig.View view, Connection connection) throws SQLException {
        var setColumns = view.columns.stream().filter(column -> column.type.isSet()).toList();
        if (!setColumns.isEmpty()) {
            String viewName = view.name.toLowerCase();
            var mvName = "mv_%s".formatted(viewName);
            log.info("{} refresh has started", mvName);
            dropMaterializedViewIfExists(mvName, connection);
            createViewMaterializedView(mvName, view, setColumns, connection);
            createMaterializedViewIndex(viewName + INDEX_POSTFIX, mvName, viewName + "id", connection);
            log.info("{} refresh has finished successfully", mvName);
        }
    }

    public void createOrUpdateJoinMaterializedView(ViewsConfig.View view, Connection connection) throws SQLException {
        for (ViewsConfig.View.JoinView joinView : view.join) {
            String viewName = view.name.toLowerCase();
            String joinViewName = joinView.view.toLowerCase();
            var mvName = "mv_%s_join_%s".formatted(viewName, joinViewName);
            log.info("{} refresh has started", mvName);
            dropMaterializedViewIfExists(mvName, connection);
            createJoinMaterializedViews(view.name, joinView, connection);
            createMaterializedViewIndex(mvName + "_" + viewName + INDEX_POSTFIX, mvName, viewName + "_id", connection);
            createMaterializedViewIndex(mvName + "_" + joinViewName + INDEX_POSTFIX, mvName, joinViewName + "_id", connection);
            log.info("{} refresh has finished successfully", mvName);
        }
    }

    private void createMaterializedViewIndex(String indexName, String materializedViewName, String columnName, Connection connection) throws SQLException {
        var query = "CREATE INDEX %s on %s (%s)".formatted(indexName, materializedViewName, columnName);
        try (var ps = connection.prepareStatement(query)) {
            ps.execute();
            connection.commit();
        }
    }

    private void createViewMaterializedView(String viewOrTableName, ViewsConfig.View view, List<ViewsConfig.View.Column> setColumns, Connection connection) throws SQLException {
        String viewName = view.name.toLowerCase();
        var queryBuilder = new StringBuilder()
                .append("CREATE MATERIALIZED VIEW ").append(viewOrTableName).append(" AS ")
                .append("SELECT v.id AS ").append(viewName).append("id, ");
        for (int i = 0; i < setColumns.size(); i++) {
            queryBuilder.append("i").append(i).append(".").append(setColumns.get(i).name.toLowerCase());
            if (i != setColumns.size() - 1) {
                queryBuilder.append(", ");
            }
        }
        queryBuilder.append(" FROM ").append(viewName).append(" v ");
        for (int i = 0; i < setColumns.size(); i++) {
            var alias = "i" + i;
            var columnName = setColumns.get(i).name.toLowerCase();
            queryBuilder.append("LEFT JOIN ").append(viewName).append("_").append(columnName).append(" ").append(alias).append(" ON ")
                    .append("v.id = ").append(alias).append(".").append(viewName).append("_id ");
        }

        try (var ps = connection.prepareStatement(queryBuilder.toString())) {
            ps.execute();
            connection.commit();
        }
    }

    private void createJoinMaterializedViews(String viewName, ViewsConfig.View.JoinView joinView, Connection connection) throws SQLException {
        var viewTableName = viewName.toLowerCase();
        var joinTable = configuration.joinTables.get(joinView.view).get(viewName).name;
        var joinedTable = configuration.viewTables.get(joinView.view).name.toLowerCase();
        var viewIdColumn = viewTableName + "_id";
        var joinIdColumn = joinedTable + "_id";
        var joinLabelColumn = joinedTable + "_label";
        var queryBuilder = new StringBuilder()
                .append("create materialized view mv_").append(viewTableName).append("_join_").append(joinedTable).append(" as ")
                .append("with numbered_rows AS (select v.id  AS ").append(viewIdColumn).append(", ")
                .append("jt.").append(joinIdColumn).append(", ")
                .append("jt_0.label AS ").append(joinLabelColumn).append(", ");

        var columns = new ArrayList<>(List.of(viewIdColumn, joinIdColumn, joinLabelColumn));

        var tableAliases = new HashMap<String, String>();
        for (int i = 0; i < joinView.include.size(); i++) {
            var attr = joinView.include.get(i);
            if ("id".equalsIgnoreCase(attr)) {
                continue;
            }
            var isOfSetType = configuration.propertyTables.getOrDefault(joinView.view, Map.of()).containsKey(attr);
            tableAliases.put(joinedTable + "_" + attr.toLowerCase(), isOfSetType ? "jt_" + (i + 1) : "jt_0");
        }
        for (int i = 0; i < joinView.include.size(); i++) {
            var attr = joinView.include.get(i).toLowerCase();
            if ("id".equalsIgnoreCase(attr)) {
                continue;
            }
            var columnName = joinedTable + "_" + attr;
            queryBuilder
                    .append(tableAliases.get(columnName)).append(".").append(attr).append(" AS ").append(columnName).append(", ");
            columns.add(columnName);
        }

        queryBuilder
                .append("row_number() over (partition by v.id) as rn ")
                .append("from ").append(viewTableName).append(" v ");

        queryBuilder
                .append("left join ").append(joinTable).append(" jt on v.id = jt.").append(viewTableName).append("_id ")
                .append("left join ").append(joinedTable).append(" jt_0 on jt_0.id = jt.").append(joinedTable).append("_id ");


        for (int i = 0; i < joinView.include.size(); i++) {
            var attr = joinView.include.get(i);
            var isOfSetType = configuration.propertyTables.getOrDefault(joinView.view, Map.of()).containsKey(attr);
            if (!isOfSetType) {
                continue;
            }
            var columnName = joinedTable + "_" + attr.toLowerCase();
            queryBuilder
                    .append("left join ").append(columnName).append(" ").append(tableAliases.get(columnName)).append(" on ").append("jt.").append(joinedTable).append("_id = ").append(tableAliases.get(columnName)).append(".").append(joinedTable).append("_id ");
        }

        queryBuilder
                .append(") ");

        queryBuilder
                .append("select ").append(String.join(", ", columns))
                .append(" from numbered_rows where rn <= ").append("50");

        try (var ps = connection.prepareStatement(queryBuilder.toString())) {
            ps.execute();
            connection.commit();
        }
    }

    private void dropMaterializedViewIfExists(String viewName, Connection connection) throws SQLException {
        var query = "DROP MATERIALIZED VIEW IF EXISTS %s CASCADE".formatted(viewName);
        try (var ps = connection.prepareStatement(query)) {
            ps.execute();
            connection.commit();
        }
    }

}
