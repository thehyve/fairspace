package io.fairspace.saturn.config;

import io.fairspace.saturn.rdf.search.*;
import io.fairspace.saturn.rdf.transactions.*;
import io.fairspace.saturn.services.*;
import org.eclipse.jetty.proxy.*;

import javax.servlet.http.*;
import java.util.*;

public class SearchProxyServlet extends ProxyServlet {
    final String apiPrefix;
    final String elasticsearchUrl;
    final IndexDispatcher indexDispatcher;
    final Transactions tx;

    public SearchProxyServlet(String apiPrefix, String elasticsearchUrl, Transactions tx, IndexDispatcher indexDispatcher) {
        this.apiPrefix = apiPrefix;
        this.elasticsearchUrl = elasticsearchUrl;
        this.tx = tx;
        this.indexDispatcher = indexDispatcher;
    }

    @Override
    protected String rewriteTarget(HttpServletRequest clientRequest) {
        var searchRequest = clientRequest.getRequestURI().replaceFirst(apiPrefix + "/search/", "");
        var requestParts = searchRequest.split("/", 2);
        if (requestParts[0].isEmpty()) {
            return elasticsearchUrl;
        }
        var requestedIndices = Set.of(requestParts[0].split(","));
        var suffix = requestParts.length > 1 ? requestParts[1] : "";
        if (requestedIndices.contains("_search") && !suffix.isEmpty()) {
            throw new IllegalArgumentException();
        }
        var availableIndices = tx.calculateRead(m -> Set.of(indexDispatcher.getAvailableIndexes()));
        if (availableIndices.contains("_all")) {
            return clientRequest.getRequestURI().replaceFirst(apiPrefix + "/search", elasticsearchUrl);
        }
        if (availableIndices.isEmpty()) {
            throw new AccessDeniedException();
        }
        var indices = new HashSet<>(availableIndices);
        if (!(requestedIndices.contains("_all") || requestedIndices.contains("_search"))) {
            indices.retainAll(requestedIndices);
        }
        if (suffix.isEmpty()) {
            return String.join("/", elasticsearchUrl, String.join(",", indices));
        }
        return String.join("/", elasticsearchUrl, String.join(",", indices), suffix);
    }
}
