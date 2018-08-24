package io.fairspace.ceres.repository

import io.fairspace.ceres.BaseCeresTest
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.reasoner.ReasonerRegistry
import org.apache.jena.util.FileManager
import org.junit.Before
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue


class InferenceTest: BaseCeresTest() {
    var NS = "http://fairspace.io/ontology#"

    // Build a trivial example data set
    val modelForInference = ModelFactory.createDefaultModel()
    var inferenceModel: Model? = null

    var sample = modelForInference.createResource(NS + "sample")
    var subject = modelForInference.createResource(NS + "subject")

    var derivesFrom = modelForInference.createProperty(NS, "derivesFrom")
    var provides = modelForInference.createProperty(NS, "provides")

    @Before
    fun init() {
        modelForInference.removeAll()
        inferenceModel = FileManager.get().loadModel("inference-model.jsonld")
    }

    @Test
    fun `see if model is setup properly`() {
        modelForInference.add(sample, derivesFrom, subject)

        val sampleStatements = modelForInference.listStatements(sample, derivesFrom, null as RDFNode?)
        assertTrue(sampleStatements.hasNext());

        val subjectStatements = modelForInference.listStatements(subject, provides, null as RDFNode?)
        assertFalse(subjectStatements.hasNext());
    }

    @Test
    fun `see if inference works`() {
        modelForInference.add(sample, derivesFrom, subject)

        var reasoner = ReasonerRegistry.getOWLReasoner()
        reasoner = reasoner.bindSchema(inferenceModel)

        val inferred = ModelFactory.createInfModel(reasoner, modelForInference)

        val subjectStatements = inferred.listStatements(subject, provides, null as RDFNode?)
        assertTrue(subjectStatements.hasNext());
    }

    @Test
    fun `see if inference works the other way around`() {
        modelForInference.add(subject, provides, sample)

        var reasoner = ReasonerRegistry.getOWLReasoner()
        reasoner = reasoner.bindSchema(inferenceModel)

        val inferred = ModelFactory.createInfModel(reasoner, modelForInference)

        val sampleStatements = inferred.listStatements(sample, derivesFrom, null as RDFNode?)
        assertTrue(sampleStatements.hasNext());
    }

    @Test
    fun `see if inference works with data added after the inferred model was created`() {

        var reasoner = ReasonerRegistry.getOWLReasoner()
        reasoner = reasoner.bindSchema(inferenceModel)

        val inferred = ModelFactory.createInfModel(reasoner, modelForInference)

        modelForInference.add(sample, derivesFrom, subject)

        val subjectStatements = inferred.listStatements(subject, provides, null as RDFNode?)
        assertTrue(subjectStatements.hasNext());
    }

}