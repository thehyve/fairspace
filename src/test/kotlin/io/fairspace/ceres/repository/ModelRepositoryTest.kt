package io.fairspace.ceres.repository

import io.fairspace.ceres.BaseCeresTest
import org.apache.jena.query.Dataset
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.vocabulary.VCARD
import org.koin.standalone.inject
import kotlin.test.*


class ModelRepositoryTest: BaseCeresTest() {
    val dataset: Dataset by inject()
    val repo: ModelRepository by inject()

    @Test
    fun `adding an empty model is a noop`() {
        val delta = ModelFactory.createDefaultModel()
        repo.add("test", delta)
        assertFalse(dataset.listNames().hasNext())
        assertTrue(dataset.isEmpty)
    }

    @Test
    fun `adding to an empty model results in an isomorphic model`() {
        repo.add("test", model)

        assertTrue(dataset.listNames().asSequence().contains("test"))
        assertTrue(model.isIsomorphicWith(dataset.getNamedModel("test")))
        assertEquals(4, repo.list("test", null, null).listStatements().toList().size)
    }

    @Test
    fun `adding a model is idempotent`() {
        repo.add("test", model)
        repo.add("test", model)

        assertTrue(dataset.listNames().asSequence().contains("test"))
        assertTrue(model.isIsomorphicWith(dataset.getNamedModel("test")))
        assertEquals(4, repo.list("test", null, null).listStatements().toList().size)
    }

    @Test
    fun `single statement removal works as expected`() {
        repo.add("test", model)
        repo.remove("test", personURI, VCARD.FN.toString())
        assertEquals(model.listStatements().toList().size - 1,
                repo.list("test", null, null).listStatements().toList().size)
    }
}