package io.fairspace.saturn.services.views;

import java.sql.*;
import java.util.*;

public class ViewService {
    final ViewStoreClient viewStoreClient;

    public ViewService(ViewStoreClient viewStoreClient) {
        this.viewStoreClient = viewStoreClient;
    }

    protected ViewPage retrieveViewPage(ViewRequest request) throws SQLException {
        int page = (request.page != null && request.page >= 1) ? request.page : 1;
        int size = (request.size != null && request.size >= 1) ? request.size : 20;
        List<Map<String, Object>> rows = viewStoreClient.retrieveRows(
                request.view, request.filters, (page - 1) * size, size);
        int count = viewStoreClient.countRows(request.view, request.filters);
        return ViewPage.builder()
                .page(page)
                .size(size)
                .totalElements(count)
                .totalPages(count / size + ((count % size > 0) ? 1 : 0))
                .rows(rows)
                .build();
    }
}
