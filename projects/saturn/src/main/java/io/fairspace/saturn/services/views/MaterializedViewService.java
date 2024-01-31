package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.ConfigLoader;
import io.fairspace.saturn.config.ViewsConfig;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;

@Slf4j
public class MaterializedViewService {

    private final DataSource dataSource;

    public MaterializedViewService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void createOrUpdateAllMaterializedViews() throws SQLException {
        for (var view : VIEWS_CONFIG.views) {
            createOrUpdateMaterializedView(view);
        }
    }

    public void createOrUpdateMaterializedView(ViewsConfig.View view) throws SQLException {
        var setColumns = view.columns.stream().filter(column -> column.type.isSet()).toList();
        if (!setColumns.isEmpty()) {
            var viewName = "materialized_view_%s".formatted(view.name.toLowerCase());
            log.info("{} refresh has started", viewName);
            dropMaterializedViewIfExists(viewName);
            createMaterializedView(viewName, view, setColumns);
            alterOwnerToFairspace(viewName);
            createMaterializedViewIndex(view.name.toLowerCase(), viewName);
            log.info("{} refresh has finished successfully", viewName);
        }
    }

    private void createMaterializedViewIndex(String viewName, String materializedViewName) throws SQLException {
        var query = "CREATE INDEX %s_id_idx on %s (%sid)".formatted(viewName, materializedViewName, viewName);
        try (var connection = dataSource.getConnection();
             var ps = connection.prepareStatement(query)) {
            ps.execute();
            connection.commit();
        }
    }

    private void alterOwnerToFairspace(String viewOrTableName) throws SQLException {
        var query = "ALTER MATERIALIZED VIEW %s OWNER TO fairspace".formatted(viewOrTableName);
        try (var connection = dataSource.getConnection();
             var ps = connection.prepareStatement(query)) {
            ps.execute();
            connection.commit();
        }
    }

    private void createMaterializedView(String viewOrTableName, ViewsConfig.View view, List<ViewsConfig.View.Column> setColumns) throws SQLException {
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

        try (var connection = dataSource.getConnection();
             var ps = connection.prepareStatement(queryBuilder.toString())) {
            ps.execute();
            connection.commit();
        }
    }

    private void dropMaterializedViewIfExists(String viewName) throws SQLException {
        var query = "DROP MATERIALIZED VIEW IF EXISTS %s CASCADE".formatted(viewName);
        try (var connection = dataSource.getConnection();
             var ps = connection.prepareStatement(query)) {
            ps.execute();
            connection.commit();
        }
    }

}
