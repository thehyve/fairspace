package io.fairspace.ceres.repository

import io.fairspace.ceres.TestData
import org.apache.jena.query.Dataset
import org.apache.jena.query.DatasetFactory
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner
import org.apache.jena.vocabulary.VCARD
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class ModelRepositoryTest {
    var repo: ModelRepository? = null
    var dataset: Dataset? = null
    var reasoner: Reasoner? = null

    @Before
    fun setUp() {
        dataset = DatasetFactory.create()
        reasoner = GenericRuleReasoner(emptyList())
        repo = ModelRepository(dataset!!, reasoner!!)
    }

    @Test
    fun `adding an empty model is a noop`() {
        val delta = ModelFactory.createDefaultModel()
        repo!!.add(delta)
        assertFalse(dataset!!.listNames().hasNext())
        assertTrue(dataset!!.isEmpty)
    }

    @Test
    fun `adding to an empty model results in an isomorphic model`() {
        repo!!.add(TestData.model)

        assertTrue(TestData.model.isIsomorphicWith(dataset!!.defaultModel))
        assertEquals(4, repo!!.list(null, null).listStatements().toList().size)
    }

    @Test
    fun `adding a model is idempotent`() {
        repo!!.add(TestData.model)
        repo!!.add(TestData.model)
        assertTrue(TestData.model.isIsomorphicWith(dataset!!.defaultModel))
        assertEquals(4, repo!!.list(null, null).listStatements().toList().size)
    }

    @Test
    fun `single statement removal works as expected`() {
        repo!!.add(TestData.model)
        repo!!.remove(TestData.personURI, VCARD.FN.toString())
        assertEquals(TestData.model.listStatements().toList().size - 1,
                repo!!.list( null, null).listStatements().toList().size)
    }

    @Test
    fun `adding data will not remove the old data`() {
        val personResource = TestData.model.createResource(TestData.personURI);
        val newName = "William Shakespeare"

        // Initialize with initial model
        repo!!.add(TestData.model)
        assertTrue(repo!!.list(TestData.personURI).contains(personResource, VCARD.FN, TestData.fullName))

        // Add a new name
        val delta = ModelFactory.createDefaultModel().apply {
            createResource(TestData.personURI)
                    .addProperty(VCARD.FN, newName)
        }
        repo!!.add(delta)

        // Ensure the fullname has been added, but that the previous one is still there
        assertTrue(repo!!.list(TestData.personURI).contains(personResource, VCARD.FN, newName))
        assertTrue(repo!!.list(TestData.personURI).contains(personResource, VCARD.FN, TestData.fullName))
    }

    @Test
    fun `updating data removes old values but leaves other data untouched`() {
        val personResource = TestData.model.createResource(TestData.personURI);
        val newName = "William Shakespeare"

        // Initialize with initial model
        repo!!.add(TestData.model)
        assertTrue(repo!!.list(TestData.personURI).contains(personResource, VCARD.FN, TestData.fullName))

        // Store the curent name model (firstname and lastname)
        val name = repo!!.list(TestData.personURI, VCARD.N.toString())

        // Update the persons name
        val delta = ModelFactory.createDefaultModel().apply {
            createResource(TestData.personURI)
                    .addProperty(VCARD.FN, newName)
        }
        repo!!.update(delta)

        // Ensure the fullname has changed
        assertTrue(repo!!.list(TestData.personURI).contains(personResource, VCARD.FN, newName))
        assertFalse(repo!!.list(TestData.personURI).contains(personResource, VCARD.FN, TestData.fullName))

        // Ensure the name (first and last) have not changed
        assertTrue(name.isIsomorphicWith(repo!!.list(TestData.personURI, VCARD.N.toString())))
    }

}
