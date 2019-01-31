package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.StoredContent;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import org.apache.commons.io.IOUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_FILE;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class FileRdfResourceTest {
    @Mock
    private RdfBackedVfsResourceFactory resourceFactory;

    @Mock
    private VfsContentStore contentStore;

    @Test
    public void testUpdateFile() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenReturn(new StoredContent("test-location", 20));

        FileRdfResource file= instantiateTestResource("http://test-resource", "/dir/test.txt");
        file.updateContents("abcdef", inputStream);

        verify(contentStore).putContent("/dir/test.txt", inputStream);
        verify(resourceFactory).updateFile(file, 20l, "abcdef", "test-location");
    }

    @Test
    public void testFailedContentStorageDoesNotShowUpInResourcesForUpdates() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenThrow(new IOException());

        try {
            FileRdfResource file= instantiateTestResource("http://test-resource", "/dir/test.txt");
            file.updateContents("abcdef", inputStream);
            fail("IOException on storage should be propagated to the client");
        } catch(IOException e) {
            // Expected exception
        }

        verify(resourceFactory, times(0)).updateFile(any(), any(), any(), any());
    }

    private FileRdfResource instantiateTestResource(String uri, String path) {
        Model model = ModelFactory.createDefaultModel();
        Resource resource = model.createResource(uri);
        model.add(resource, RDF.type, TYPE_FILE);
        model.add(resource, PATH, path);

        return new FileRdfResource(resource, model, resourceFactory, contentStore);
    }

}
