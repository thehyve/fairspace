package io.fairspace.saturn.config;

import io.fairspace.saturn.rdf.search.*;
import io.fairspace.saturn.rdf.transactions.*;
import io.fairspace.saturn.services.*;
import org.junit.*;
import org.junit.runner.*;
import org.mockito.*;
import org.mockito.junit.*;

import javax.servlet.http.*;

import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class SearchProxyServletTest {
    static final String API_PREFIX = "/api";
    static final String SEARCH_PREFIX = API_PREFIX + "/search";
    static final String SEARCH_URL = "http://localhost:9200";

    Transactions tx = new BulkTransactions(createTxnMem());

    @Mock
    IndexDispatcher indexDispatcher;

    @Test
    public void allowsAllForAdmins() {
        when(indexDispatcher.getAvailableIndexes()).thenReturn(new String[] {"_all"});
        var proxy = new SearchProxyServlet(API_PREFIX, SEARCH_URL, tx, indexDispatcher);

        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_all");
        assertEquals(SEARCH_URL + "/_all", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_search");
        assertEquals(SEARCH_URL + "/_search", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_all/_search");
        assertEquals(SEARCH_URL + "/_all/_search", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_all/something/_search");
        assertEquals(SEARCH_URL + "/_all/something/_search", proxy.rewriteTarget(request));
    }

    @Test
    public void allowsSpecificIndicesForAdmins() {
        when(indexDispatcher.getAvailableIndexes()).thenReturn(new String[] {"_all"});
        var proxy = new SearchProxyServlet(API_PREFIX, SEARCH_URL, tx, indexDispatcher);

        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/shared,collection_c1");
        assertEquals(SEARCH_URL + "/shared,collection_c1", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/shared,collection_c1/_search");
        assertEquals(SEARCH_URL + "/shared,collection_c1/_search", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/shared,collection_c1/something/_search");
        assertEquals(SEARCH_URL + "/shared,collection_c1/something/_search", proxy.rewriteTarget(request));
    }

    @Test
    public void restrictAllForNonAdmins() {
        when(indexDispatcher.getAvailableIndexes()).thenReturn(new String[] {"shared", "collection_c1"});
        var proxy = new SearchProxyServlet(API_PREFIX, SEARCH_URL, tx, indexDispatcher);

        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_all");
        assertEquals(SEARCH_URL + "/shared,collection_c1", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_search");
        assertEquals(SEARCH_URL + "/shared,collection_c1", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_all/_search");
        assertEquals(SEARCH_URL + "/shared,collection_c1/_search", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_all/something/_search");
        assertEquals(SEARCH_URL + "/shared,collection_c1/something/_search", proxy.rewriteTarget(request));
    }

    @Test
    public void restrictSpecificIndicesForNonAdmins() {
        when(indexDispatcher.getAvailableIndexes()).thenReturn(new String[] {"shared", "collection_c1"});
        var proxy = new SearchProxyServlet(API_PREFIX, SEARCH_URL, tx, indexDispatcher);

        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/shared");
        assertEquals(SEARCH_URL + "/shared", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/collection_c1,collection_c2/_search");
        assertEquals(SEARCH_URL + "/collection_c1/_search", proxy.rewriteTarget(request));
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/shared,collection_c1,collection_c2/something/_search");
        assertEquals(SEARCH_URL + "/shared,collection_c1/something/_search", proxy.rewriteTarget(request));
    }

    @Test(expected = AccessDeniedException.class)
    public void searchDeniedForUsersWithoutAccess() {
        when(indexDispatcher.getAvailableIndexes()).thenReturn(new String[] {});
        var proxy = new SearchProxyServlet(API_PREFIX, SEARCH_URL, tx, indexDispatcher);

        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_all");
        proxy.rewriteTarget(request);
    }

    @Test(expected = IllegalArgumentException.class)
    public void failOnIllegalSearchQuery() {
        var proxy = new SearchProxyServlet(API_PREFIX, SEARCH_URL, tx, indexDispatcher);

        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn(SEARCH_PREFIX + "/_search/something");
        proxy.rewriteTarget(request);
    }
}
