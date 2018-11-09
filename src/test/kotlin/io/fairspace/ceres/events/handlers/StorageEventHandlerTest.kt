package io.fairspace.ceres.events.handlers

import io.fairspace.ceres.events.model.Collection
import io.fairspace.ceres.events.model.PathType
import io.fairspace.ceres.events.model.StorageEvent
import io.fairspace.ceres.metadata.repository.ModelRepository
import io.fairspace.ceres.metadata.service.MetadataService
import io.fairspace.ceres.metadata.vocabulary.Fairspace
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.model.PidDTO
import io.fairspace.ceres.pid.service.PidService
import junit.framework.TestCase.assertTrue
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.vocabulary.RDF
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatcher
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class StorageEventHandlerTest {
    @Mock
    lateinit var pidService: PidService

    @Mock
    lateinit var modelRepository: ModelRepository

    @Mock
    lateinit var metadataService: MetadataService

    lateinit var handler: StorageEventHandler

    @Before
    fun setUp() {
        handler = StorageEventHandler(pidService, modelRepository, metadataService)
    }

    @Test
    fun receiveCreateMessageForTopLevelDirectory() {
        val dirUri = "http://subdir-1"
        val collectionUri = "http://collection-1"
        val event = StorageEvent(path = "/collection-1/subdir", type = PathType.DIRECTORY, collection = Collection(uri = collectionUri))

        `when`(pidService.findOrCreateByValue("/collection-1/subdir")).thenReturn(PidDTO(dirUri, "/subdir"));

        handler.receiveCreateMessage(event)

        verifyParentRelationStored(collectionUri, dirUri, Fairspace.directory)
    }

    @Test
    fun receiveCreateMessageForNestedFile() {
        val dirUri = "http://subdir-1"
        val fileUri = "http://fileuri-2"
        val event = StorageEvent(path = "/collection-1/subdir/file.txt", type = PathType.FILE, collection = Collection())

        `when`(pidService.findOrCreateByValue("/collection-1/subdir")).thenReturn(PidDTO(dirUri, "/subdir"));
        `when`(pidService.findOrCreateByValue("/collection-1/subdir/file.txt")).thenReturn(PidDTO(fileUri, "/subdir/file.txt"));

        handler.receiveCreateMessage(event)

        verifyParentRelationStored(dirUri, fileUri, Fairspace.file)
    }

    @Test
    fun receiveMoveMessageWithinSameDirectory() {
        val collectionUri = "http://collection-1"
        val event = StorageEvent(path = "/collection-1/subdir", destination = "/collection-1/subdir2", type = PathType.DIRECTORY, collection = Collection(uri = collectionUri))

        handler.receiveMoveMessage(event)

        verify(pidService).updateByPrefix("/collection-1/subdir", "/collection-1/subdir2");
        verify(modelRepository, times(0)).update(modelArgThat(ArgumentMatcher{ true }))
    }

    @Test
    fun receiveMoveMessageToOtherDirectory() {
        val dirUri = "http://dir-1"
        val subdirUri = "http://subdiruri-2"
        val event = StorageEvent(path = "/collection-1/subdir", destination = "/collection-1/subdir2/nested", type = PathType.DIRECTORY, collection = Collection())

        `when`(pidService.findOrCreateByValue("/collection-1/subdir2")).thenReturn(PidDTO(dirUri, "/subdir2"));
        `when`(pidService.findOrCreateByValue("/collection-1/subdir2/nested")).thenReturn(PidDTO(subdirUri, "/subdir2/nested"));

        handler.receiveMoveMessage(event)

        verifyParentRelationStored(dirUri, subdirUri, Fairspace.directory)
    }

    @Test
    fun receiveCopyMessageWithinSameDirectory() {
        val collectionUri = "http://collection-1"
        val event = StorageEvent(path = "/collection-1/subdir", destination = "/collection-1/subdir2", type = PathType.DIRECTORY, collection = Collection(uri = collectionUri))

        // Original identifiers
        `when`(pidService.findByPrefix("/collection-1/subdir")).thenReturn(listOf(
                PidDTO("http://dir", "/collection-1/subdir"),
                PidDTO("http://file", "/collection-1/subdir/file1"),
                PidDTO("http://subdir", "/collection-1/subdir/dir2"),
                PidDTO("http://nested", "/collection-1/subdir/dir2/collection-1/subdir")
        ))

        // Original metadata
        `when`(metadataService.getMetadataForResources(setOf("http://dir", "http://file", "http://subdir", "http://nested")))
                .thenReturn(ModelFactory.createDefaultModel().apply {
                    val dir = createResource("http://dir")
                    val file = createResource("http://file")
                    val property = createProperty("http://property")

                    add(dir, property, file)
                })

        // New identifiers
        `when`(pidService.findOrCreateByValue("/collection-1/subdir2")).thenReturn(PidDTO("http://newdir", ""))
        `when`(pidService.findOrCreateByValue("/collection-1/subdir2/file1")).thenReturn(PidDTO("http://newfile", ""))
        `when`(pidService.findOrCreateByValue("/collection-1/subdir2/dir2")).thenReturn(PidDTO("http://newsubdir", ""))
        `when`(pidService.findOrCreateByValue("/collection-1/subdir2/dir2/collection-1/subdir")).thenReturn(PidDTO("http://newnested", ""))

        handler.receiveCopyMessage(event)

        verify(modelRepository).add(modelArgThat(ArgumentMatcher{
            val newdir = it.createResource("http://newdir")
            val newfile = it.createResource("http://newfile")
            val property = it.createProperty("http://property")

            it.contains(newdir, property, newfile)
        }))

        verify(modelRepository, times(0)).update(modelArgThat(ArgumentMatcher { true }))
    }

    @Test
    fun receiveCopyMessageToOtherDirectory() {
        val collectionUri = "http://collection-1"
        val event = StorageEvent(path = "/collection-1/subdir", destination = "/collection-1/subdir2/nested", type = PathType.DIRECTORY, collection = Collection(uri = collectionUri))

        // Original identifiers
        `when`(pidService.findByPrefix("/collection-1/subdir")).thenReturn(listOf(
                PidDTO("http://dir", "/collection-1/subdir")
        ))

        // Original metadata
        `when`(metadataService.getMetadataForResources(setOf("http://dir"))).thenReturn(ModelFactory.createDefaultModel())

        // New identifiers
        `when`(pidService.findOrCreateByValue("/collection-1/subdir2/nested")).thenReturn(PidDTO("http://newdir", ""))
        `when`(pidService.findOrCreateByValue("/collection-1/subdir2")).thenReturn(PidDTO("http://newparentdir", ""))

        handler.receiveCopyMessage(event)

        verifyParentRelationStored("http://newparentdir", "http://newdir", Fairspace.directory)
    }

    @Test
    fun receiveDeleteMessage() {
        val collectionUri = "http://collection-1"
        val event = StorageEvent(path = "/collection-1/subdir", type = PathType.DIRECTORY, collection = Collection(uri = collectionUri))

        handler.receiveDeleteMessage(event)

        verify(pidService).deleteByPrefix("/collection-1/subdir")

    }

    @Test
    fun messagesForTopLevelDirectoriesAreIgnored() {
        val event = StorageEvent(path = "/top-level", type = PathType.DIRECTORY)
        verifyIgnore(event)
    }

    @Test
    fun messagesForUnknownResourceTypeAreIgnored() {
        val event = StorageEvent(path = "/useful/directory/within", type = PathType.UNKNOWN)
        verifyIgnore(event)
    }

    @Test
    fun testMetadataReplacement() {
        val input = ModelFactory.createDefaultModel().apply {
            val dir = createResource("http://dir")
            val file = createResource("http://file")
            val unknown = createResource("http://unknown")
            val property = createProperty("http://property")

            // Mapped resources
            add(dir, property, file)
            add(file, property, dir)

            // Unmapped resources
            add(unknown, property, dir)
            add(dir, property, unknown)

            // Totally unrelated statement
            add(unknown, property, unknown)

            // Literal values
            add(dir, property, createLiteral("literal"))
        }

        val mapping = mapOf<String, String>(
                "http://dir" to "http://newdir",
                "http://file" to "http://newfile"
        )

        handler.replaceEntities(input, mapping).apply {
            val dir = createResource("http://newdir")
            val file = createResource("http://newfile")
            val unknown = createResource("http://unknown")
            val property = createProperty("http://property")

            assertTrue(contains(dir, property, file))
            assertTrue(contains(file, property, dir))
            assertTrue(contains(unknown, property, dir))
            assertTrue(contains(dir, property, unknown))
            assertTrue(contains(unknown, property, unknown))
            assertTrue(contains(dir, property, createLiteral("literal")))
        }
    }

    private fun verifyParentRelationStored(parentUri: String, childUri: String, typeUri: String) {
        verify(modelRepository).update(modelArgThat(ArgumentMatcher {
            val parent = it.createResource(parentUri)
            val child = it.createResource(childUri)
            val partOf = it.createProperty(Fairspace.partOf)
            val type = it.createProperty(typeUri)

            it.contains(child, partOf, parent) && it.contains(child, RDF.type, type)
        }))
    }

    private fun verifyIgnore(event: StorageEvent) {
        handler.receiveCreateMessage(event)
        handler.receiveCopyMessage(event)
        handler.receiveMoveMessage(event)
        handler.receiveDeleteMessage(event)

        verifyZeroInteractions(pidService)
        verifyZeroInteractions(modelRepository)
        verifyZeroInteractions(metadataService)
    }

    /**
     * Argument matchers return null by default, but kotlin will raise errors on that
     * For that reason, this wrapper method returns a default Model in those cases
     */
    private fun modelArgThat(matcher: ArgumentMatcher<Model>) = argThat(matcher) ?: ModelFactory.createDefaultModel()

}
