package io.fairspace.saturn.vfs;

import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.permissions.Access;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class CompoundFileSystemTest {

    @Mock
    private CollectionsService collections;

    @Mock
    private VirtualFileSystem vfs1;

    @Mock
    private VirtualFileSystem vfs2;

    @Mock
    private VirtualFileSystem vfs3;

    private CompoundFileSystem fs;

    @Before
    public void before() {
        fs = new CompoundFileSystem(collections, Map.of("prefix1", vfs1, "prefix2", vfs2, "", vfs3));

        var c1 = new Collection();
        c1.setAccess(Access.Manage);
        c1.setLocation("dir1");
        c1.setIri(createURI("http://example.com/123"));
        c1.setConnectionString("prefix1://user.zone:password@some.url:123/path?param=value");

        var c2 = new Collection();
        c2.setIri(createURI("http://example.com/234"));
        c2.setConnectionString("prefix2://some.url");
        c2.setAccess(Access.Read);
        c2.setLocation("dir2");

        var c3 = new Collection();
        c3.setIri(createURI("http://example.com/345"));
        c3.setConnectionString("prefix3://some.url");
        c3.setAccess(Access.Read);
        c3.setLocation("dir3");

        var c4 = new Collection();
        c4.setIri(createURI("http://example.com/456"));
        c4.setConnectionString("!malformed url!");
        c4.setAccess(Access.Read);
        c4.setLocation("dir4");

        var c5 = new Collection();
        c5.setIri(createURI("http://example.com/567"));
        c5.setConnectionString("");
        c5.setAccess(Access.Write);
        c5.setLocation("dir5");

        when(collections.list()).thenReturn(List.of(c1, c2, c3, c4, c5));
        when(collections.getByLocation("dir1")).thenReturn(c1);
        when(collections.getByLocation("dir2")).thenReturn(c2);
        when(collections.getByLocation("dir3")).thenReturn(c3);
        when(collections.getByLocation("dir4")).thenReturn(c4);
        when(collections.getByLocation("dir5")).thenReturn(c5);
    }

    @Test
    public void returnsCollectionsForRoot() throws IOException {
        assertEquals(fs.list("").size(), collections.list().size());
    }

    @Test
    public void delegatesToCorrectFS() throws IOException {
        fs.list("dir1/path");
        verify(vfs1).list("dir1/path");
        verifyZeroInteractions(vfs2);

        fs.stat("dir2/path");
        verify(vfs2).stat("dir2/path");

        fs.mkdir("dir5/path");
        verify(vfs3).mkdir("dir5/path");
    }

    @Test(expected = FileNotFoundException.class)
    public void returnsAnErrorForUnknownCollections() throws IOException {
        fs.mkdir("unknown/path");
    }

    @Test(expected = IOException.class)
    public void handlesUnknownSchemes() throws IOException {
        fs.stat("dir3/path");
    }

    public void handlesUnknownLocations() throws IOException {
        assertNull(fs.stat("unknown"));
    }

    @Test(expected = IOException.class)
    public void handlesMalformedURLs() throws IOException {
        fs.stat("dir4/path");
    }

    @Test(expected = IOException.class)
    public void copyingBetweenCollectionsOfDifferentTypesIsNotSupported() throws IOException {
        fs.copy("dir1/path", "dir2/path");
    }

    @Test(expected = IOException.class)
    public void movingBetweenCollectionsOfDifferentTypesIsNotSupported() throws IOException {
        fs.move("dir1/path", "dir2/path");
    }

    @Test
    public void shouldCloseAllUnderlyingFileSystems() throws IOException {
        fs.close();

        verify(vfs1).close();
        verify(vfs2).close();
        verify(vfs3).close();
    }
}