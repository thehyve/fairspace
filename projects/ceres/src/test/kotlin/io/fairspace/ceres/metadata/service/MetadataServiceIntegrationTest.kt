package io.fairspace.ceres.metadata.service

import io.fairspace.ceres.CeresApplication
import io.fairspace.ceres.metadata.repository.ModelRepository
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertTrue
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner
import org.apache.jena.reasoner.rulesys.Rule
import org.apache.jena.tdb2.TDB2Factory
import org.apache.jena.vocabulary.RDFS
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit4.SpringRunner


@RunWith(SpringRunner::class)
@SpringBootTest
class MetadataServiceIntegrationTest {
    @Configuration
    @Import(CeresApplication::class)
    class TestConfig {
        @Bean
        fun dataset() = TDB2Factory.createDataset()

        @Bean
        fun reasoner(): Reasoner {
            val rules = "[(?a http://oneway ?b) -> (?b http://otherway ?a)]"
            val reasoner = GenericRuleReasoner(Rule.parseRules(rules))
            reasoner.setDerivationLogging(true)
            return reasoner
        }
    }

    @Autowired
    lateinit var service: MetadataService

    @Autowired
    lateinit var repository: ModelRepository

    @Before
    fun setUp() {
        repository.add(ModelFactory.createDefaultModel().apply {
            val a = createResource("http://a")
            val p = createProperty("http://name")
            val b = createResource("http://b")
            val c = createResource("http://c")

            add(a, p, b)
            add(a, p, c)
            add(a, RDFS.label, "Item A")
            add(a, RDFS.comment, "Comment about item A")
            add(b, RDFS.label, "Item B")
            add(b, RDFS.comment, "Comment about item B")

            // Add data for inference
            val i = createResource("http://i")
            val p2 = createProperty("http://oneway")
            val j = createResource("http://j")

            add(i, p2, j);
            add(i, RDFS.label, "Item I")
            add(j, RDFS.label, "Item J")
        })
    }

    @Test
    fun testMetadataRetrievalForSingleResource() {
        val model = service.getMetadataForResources(listOf("http://a"))

        val a = model.createResource("http://a")
        val p = model.createProperty("http://name")
        val b = model.createResource("http://b")
        val c = model.createResource("http://c")

        assertTrue(model.contains(a, p, b))
        assertTrue(model.contains(a, p, c))
        assertTrue(model.contains(a, RDFS.label, "Item A"))
        assertTrue(model.contains(a, RDFS.comment, "Comment about item A"))
        assertEquals(4, model.size())
    }

    @Test
    fun testMetadataRetrievalForMultipleResources() {
        val model = service.getMetadataForResources(listOf("http://a", "http://b"))

        val a = model.createResource("http://a")
        val p = model.createProperty("http://name")
        val b = model.createResource("http://b")
        val c = model.createResource("http://c")

        assertTrue(model.contains(a, p, b))
        assertTrue(model.contains(a, p, c))
        assertTrue(model.contains(a, RDFS.label, "Item A"))
        assertTrue(model.contains(a, RDFS.comment, "Comment about item A"))
        assertTrue(model.contains(b, RDFS.label, "Item B"))
        assertTrue(model.contains(b, RDFS.comment, "Comment about item B"))
        assertEquals(6, model.size())
    }

    @Test
    fun testMetadataRetrievalForSimpleResource() {
        val model = service.getMetadataForResources(listOf("http://c"))
        assertTrue(model.isEmpty)
    }

    @Test
    fun testMetadataRetrievalForUnknownResource() {
        val model = service.getMetadataForResources(listOf("http://d"))
        assertTrue(model.isEmpty)
    }

    @Test
    fun testLabelRetrieval() {
        val model = service.getStatementsWithObjectLabels("http://a")

        val a = model.createResource("http://a")
        val p = model.createProperty("http://name")
        val b = model.createResource("http://b")
        val c = model.createResource("http://c")

        assertTrue(model.contains(a, p, b))
        assertTrue(model.contains(a, p, c))
        assertTrue(model.contains(a, RDFS.label, "Item A"))
        assertTrue(model.contains(a, RDFS.comment, "Comment about item A"))
        assertTrue(model.contains(b, RDFS.label, "Item B"))
        assertEquals(5, model.size())
    }

    @Test
    fun testLabelRetrievalWithoutLinks() {
        val model = service.getStatementsWithObjectLabels("http://b")

        val b = model.createResource("http://b")

        assertTrue(model.contains(b, RDFS.label, "Item B"))
        assertTrue(model.contains(b, RDFS.label, "Item B"))
        assertEquals(2, model.size())
    }


    @Test
    fun testLabelRetrievalWithPredicateAndObject() {
        val model = service.getStatementsWithObjectLabels("http://a", "http://name", "http://b")

        val a = model.createResource("http://a")
        val p = model.createProperty("http://name")
        val b = model.createResource("http://b")

        assertTrue(model.contains(a, p, b))
        assertTrue(model.contains(b, RDFS.label, "Item B"))
        assertEquals(2, model.size())
    }

    @Test
    fun testMetadataRetrievalWithInference() {
        val model = service.getStatementsWithObjectLabels("http://j")

        val i = model.createResource("http://i")
        val otherway = model.createProperty("http://otherway")
        val j = model.createResource("http://j")

        assertTrue(model.contains(j, otherway, i))
        assertTrue(model.contains(i, RDFS.label, "Item I"))
        assertTrue(model.contains(j, RDFS.label, "Item J"))
        assertEquals(3, model.size())
    }

}
