package io.fairspace.ceres

import io.fairspace.ceres.repository.ModelRepository
import org.apache.jena.query.DatasetFactory
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner
import org.apache.jena.riot.RDFFormat
import org.apache.jena.vocabulary.VCARD
import org.koin.dsl.module.Module
import org.koin.dsl.module.applicationContext
import org.koin.standalone.StandAloneContext
import org.koin.test.KoinTest
import kotlin.test.AfterTest
import kotlin.test.BeforeTest

open class BaseCeresTest : KoinTest {
    private val context = applicationContext {
        bean { DatasetFactory.create() }
        bean<Reasoner> { GenericRuleReasoner(emptyList()) }
        bean { ModelRepository(get(), get()) }
    }

    val personURI = "http://somewhere/JohnSmith"
    val givenName = "John"
    val familyName = "Smith"
    val fullName = "$givenName $familyName"

    val model = ModelFactory.createDefaultModel().apply {
        createResource(personURI)
                .addProperty(VCARD.FN, fullName)
                .addProperty(VCARD.N,
                        createResource()
                                .addProperty(VCARD.Given, givenName)
                                .addProperty(VCARD.Family, familyName))
    }

    val JSONLD = RDFFormat.JSONLD.lang.headerString

    @BeforeTest
    fun before(){
        StandAloneContext.startKoin(koinModules())
    }

    @AfterTest
    fun after(){
        StandAloneContext.closeKoin()
    }

    open fun koinModules(): List<Module> = listOf(context)
}
