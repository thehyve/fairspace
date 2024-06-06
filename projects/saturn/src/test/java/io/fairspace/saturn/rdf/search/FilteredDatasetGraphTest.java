package io.fairspace.saturn.rdf.search;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.core.Quad;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.services.metadata.MetadataPermissions;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class FilteredDatasetGraphTest {

    @Mock
    private MetadataPermissions metadataPermissions;

    @Mock
    private Dataset dataset;

    @Test
    public void testIsAllowedToReadMetadataWhenPermissionCheckDisabledAndIsDefaultGraph() {
        // give
        FilteredDatasetGraph.disableQuadPermissionCheck();
        var mockQuad = mock(Quad.class);
        when(mockQuad.isDefaultGraph()).thenReturn(true);

        // when
        var actual = FilteredDatasetGraph.isAllowedToReadMetadata(dataset, metadataPermissions, mockQuad);

        // then
        assertTrue(actual);
        FilteredDatasetGraph.enableQuadPermissionCheck();
    }

    @Test
    public void testIsNotAllowedToReadMetadataWhenGraphIsNotDefault() {
        // give
        var mockQuad = mock(Quad.class);
        when(mockQuad.isDefaultGraph()).thenReturn(false);

        // when
        var actual = FilteredDatasetGraph.isAllowedToReadMetadata(dataset, metadataPermissions, mockQuad);

        // then
        assertFalse(actual);
    }

    @Test
    public void testIsAllowedToReadMetadataWhenGraphIsDefaultAndUserCanReadMetadata() {
        // give
        var mockQuad = mock(Quad.class);
        when(mockQuad.isDefaultGraph()).thenReturn(true);
        var mockNode = mock(Node.class);
        when(mockQuad.getSubject()).thenReturn(mockNode);
        var mockModel = mock(Model.class);
        when(dataset.getDefaultModel()).thenReturn(mockModel);
        var mockResource = mock(Resource.class);
        when(mockModel.wrapAsResource(mockNode)).thenReturn(mockResource);
        when(metadataPermissions.canReadMetadata(mockResource)).thenReturn(true);

        // when
        var actual = FilteredDatasetGraph.isAllowedToReadMetadata(dataset, metadataPermissions, mockQuad);

        // then
        assertTrue(actual);
    }

    @Test
    public void testIsNotAllowedToReadMetadataWhenGraphIsDefaultAndUserCanNotReadMetadata() {
        // give
        var mockQuad = mock(Quad.class);
        when(mockQuad.isDefaultGraph()).thenReturn(true);
        var mockNode = mock(Node.class);
        when(mockQuad.getSubject()).thenReturn(mockNode);
        var mockModel = mock(Model.class);
        when(dataset.getDefaultModel()).thenReturn(mockModel);
        var mockResource = mock(Resource.class);
        when(mockModel.wrapAsResource(mockNode)).thenReturn(mockResource);
        when(metadataPermissions.canReadMetadata(mockResource)).thenReturn(false);

        // when
        var actual = FilteredDatasetGraph.isAllowedToReadMetadata(dataset, metadataPermissions, mockQuad);

        // then
        assertFalse(actual);
    }
}
