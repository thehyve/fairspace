package io.fairspace.ceres.metadata.service

import io.fairspace.ceres.metadata.repository.ModelRepository
import org.apache.jena.rdf.model.ModelFactory
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class MetadataServiceTest {
    @Mock
    lateinit var repository: ModelRepository

    lateinit var service: MetadataService

    @Before
    fun setUp() {
        service = MetadataService(repository)
        doReturn(ModelFactory.createDefaultModel()).`when`(repository).query(anyString())
    }

    @Test
    fun testGetForResources() {
        service.getMetadataForResources(setOf("http://url"))
        verify(repository).query(safeArgThat { argument ->
            argument.contains("<http://url>")
        })
    }

    @Test
    fun testGetMetadataForEmptySet() {
        service.getMetadataForResources(emptySet())
        verify(repository, times(0)).query(anyString())
    }

    @Test
    fun testGetForMultipleResources() {
        service.getMetadataForResources(setOf("http://url1", "http://url2"))
        verify(repository).query(safeArgThat { argument ->
            argument.contains("<http://url1>") && argument.contains("<http://url2>")
        })
    }

    // This method is needed because of the Kotlin null-safety. See https://github.com/mockito/mockito/issues/1255
    fun safeArgThat(validator: (String) -> Boolean): String = ArgumentMatchers.argThat(validator) ?: ""
}
