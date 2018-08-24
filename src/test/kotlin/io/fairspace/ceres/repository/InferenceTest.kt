package io.fairspace.ceres.repository

import org.apache.jena.query.DatasetFactory
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.reasoner.ReasonerRegistry
import org.apache.jena.util.FileManager
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue


class InferenceTest {
    private val NS = "http://fairspace.io/ontology#"

    // Build a trivial example data set
    private val modelForInference = ModelFactory.createDefaultModel()

    private val sample = modelForInference.createResource(NS + "sample")
    private val subject = modelForInference.createResource(NS + "subject")

    private val derivesFrom = modelForInference.createProperty(NS, "derivesFrom")
    private val provides = modelForInference.createProperty(NS, "provides")

    private val repo = ModelRepository(DatasetFactory.create(), {
        val inferenceModel = FileManager.get().loadModel("inference-model.jsonld")
        ReasonerRegistry.getOWLReasoner().bindSchema(inferenceModel)
    }())

    @Test
    fun `see if model is setup properly`() {
        modelForInference.add(sample, derivesFrom, subject)

        assertTrue(modelForInference.contains(sample, derivesFrom, subject))
        assertFalse(modelForInference.contains(subject, provides, sample))
    }

    @Test
    fun `see if inference works`() {
        modelForInference.add(sample, derivesFrom, subject)

        repo.add(modelForInference)
        val inferred = repo.list(null, null)

        assertTrue(inferred.contains(subject, provides, sample))
    }

    @Test
    fun `see if inference works the other way around`() {
        modelForInference.add(subject, provides, sample)

        repo.add(modelForInference)
        val inferred = repo.list(null, null)

        assertTrue(inferred.contains(sample, derivesFrom, subject))
    }

    @Test
    fun `see if inference works with data added after the inferred model was created`() {
        repo.add(modelForInference)

        val update = ModelFactory.createDefaultModel()
        update.add(sample, derivesFrom, subject)
        repo.add(update)

        val inferred = repo.list(null, null)

        assertTrue(inferred.contains(subject, provides, sample))
    }

}
