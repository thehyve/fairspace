package io.fairspace.ceres.metadata.repository

import org.apache.jena.query.DatasetFactory
import org.apache.jena.query.DatasetFactory.createTxnMem
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.rdf.model.ModelFactory.createDefaultModel
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.reasoner.ReasonerRegistry
import org.apache.jena.util.FileManager
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class InferenceTest {
    private val NS = "http://fairspace.io/ontology#"

    // Build a trivial example data set
    private val modelForInference = createDefaultModel()

    private val sample = modelForInference.createResource(NS + "sample")
    private val anotherSample = modelForInference.createResource(NS + "anotherSample")
    private val subject = modelForInference.createResource(NS + "subject")
    private val anotherSubject = modelForInference.createResource(NS + "anotherSubject")

    private val derivesFrom = modelForInference.createProperty(NS, "derivesFrom")
    private val provides = modelForInference.createProperty(NS, "providesMaterial")

    private val repo = ModelRepository(createTxnMem().defaultModel,
            OwlPropertyInverter(FileManager.get().loadModel("inference-model.jsonld")))

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
        assertTrue(repo.list().contains(subject, provides, sample))
    }

    @Test
    fun `see if inference works the other way around`() {
        modelForInference.add(subject, provides, sample)

        repo.add(modelForInference)
        val inferred = repo.list(null, null)

        assertTrue(inferred.contains(sample, derivesFrom, subject))
    }

    @Test
    fun `see if removal of an inferred statement works`() {
        repo.add(createDefaultModel().add(sample, derivesFrom, subject))

        assertTrue(repo.list().contains(sample, derivesFrom, subject))
        assertTrue(repo.list().contains(subject, provides, sample))

        repo.remove(subject.uri, provides.uri, sample.uri)

        assertFalse(repo.list().contains(sample, derivesFrom, subject))
        assertFalse(repo.list().contains(subject, provides, sample))
    }

    @Test
    fun `see if removal of an explicit statement works`() {
        repo.add(createDefaultModel().add(sample, derivesFrom, subject))

        assertTrue(repo.list().contains(sample, derivesFrom, subject))
        assertTrue(repo.list().contains(subject, provides, sample))

        repo.remove(sample.uri, derivesFrom.uri, subject.uri)

        assertFalse(repo.list().contains(sample, derivesFrom, subject))
        assertFalse(repo.list().contains(subject, provides, sample))
    }

    @Test
    fun `see if update of an inferred statement works`() {
        repo.add(createDefaultModel().add(sample, derivesFrom, subject))

        assertTrue(repo.list().contains(sample, derivesFrom, subject))
        assertTrue(repo.list().contains(subject, provides, sample))

        repo.update(createDefaultModel().add(subject, provides, anotherSample))

        assertTrue(repo.list().contains(anotherSample, derivesFrom, subject))
        assertTrue(repo.list().contains(subject, provides, anotherSample))
        assertFalse(repo.list().contains(sample, derivesFrom, subject))
        assertFalse(repo.list().contains(subject, provides, sample))
    }

    @Test
    fun `see if update of an explicit statement works`() {
        repo.add(createDefaultModel().add(sample, derivesFrom, subject))

        assertTrue(repo.list().contains(sample, derivesFrom, subject))
        assertTrue(repo.list().contains(subject, provides, sample))

        repo.update(createDefaultModel().add(sample, derivesFrom, anotherSubject))

        assertTrue(repo.list().contains(sample, derivesFrom, anotherSubject))
        assertTrue(repo.list().contains(anotherSubject, provides, sample))
        assertFalse(repo.list().contains(sample, derivesFrom, subject))
        assertFalse(repo.list().contains(subject, provides, sample))
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
