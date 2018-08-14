package io.fairspace.ceres

import io.fairspace.ceres.repository.parse
import io.fairspace.ceres.repository.toString
import io.ktor.config.MapApplicationConfig
import io.ktor.http.*
import io.ktor.server.testing.*
import org.apache.jena.rdf.model.ModelFactory.createDefaultModel
import org.apache.jena.rdf.model.ResourceFactory.createResource
import org.apache.jena.rdf.model.ResourceFactory.createStringLiteral
import org.apache.jena.riot.RDFFormat
import org.apache.jena.vocabulary.VCARD
import kotlin.test.*

class ModuleTest : BaseCeresTest() {
    @Test
    fun `Test the hello page`() = test {
        with(handleRequest(HttpMethod.Get, "/")) {
            assertEquals(HttpStatusCode.OK, response.status())
            assertEquals("Hi, I'm Ceres!", response.content)
        }
    }

    @Test
    fun `Test Post and Get`() {
        test {
             with(handleRequest(HttpMethod.Post, "/statements") {
                 addHeader(HttpHeaders.ContentType, JSONLD)
                 setBody(model.toString(RDFFormat.JSONLD))
             }) {
                 assertEquals(HttpStatusCode.NoContent, response.status())
             }

             with(handleRequest(HttpMethod.Get, "/statements") {
                 addHeader(HttpHeaders.Accept, JSONLD)
             }) {
                 assertEquals(HttpStatusCode.OK, response.status())
                 assertEquals(JSONLD, response.headers[HttpHeaders.ContentType])
                 val model = RDFFormat.JSONLD.parse(response.content!!)
                 assertFalse(this@ModuleTest.model == model)
                 assertTrue(this@ModuleTest.model.isIsomorphicWith(model))
             }
         }
     }

    @Test
    fun `Test Content-Type handling`() {
        test {
            with(handleRequest(HttpMethod.Post, "/statements") {
                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(model.toString(RDFFormat.RDFJSON))
            }) {
                assertEquals(HttpStatusCode.UnsupportedMediaType, response.status())
            }
        }
    }

    @Test
    fun `Test Accept handling`() {
        test {
            with(handleRequest(HttpMethod.Get, "/statements") {
                addHeader(HttpHeaders.Accept, "application/json")
            }) {
                assertEquals(HttpStatusCode.NotAcceptable, response.status())
            }
        }
    }

    @Test
    fun `Test invalid body handling`() {
        test {
            with(handleRequest(HttpMethod.Post, "/statements") {
                addHeader(HttpHeaders.ContentType, JSONLD)
                setBody("{'a':1}")
            }) {
                assertEquals(HttpStatusCode.InternalServerError, response.status())
            }
        }
    }

    @Test
    fun `Test Patch`() {
        test {
            with(handleRequest(HttpMethod.Post, "/statements") {
                addHeader(HttpHeaders.ContentType, JSONLD)
                setBody(model.toString(RDFFormat.JSONLD))
            }) {
                assertEquals(HttpStatusCode.NoContent, response.status())
            }

            with(handleRequest(HttpMethod.Get, "/statements") {
                addHeader(HttpHeaders.Accept, JSONLD)
            }) {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals(JSONLD, response.headers[HttpHeaders.ContentType])
                val model = RDFFormat.JSONLD.parse(response.content!!)
                assertTrue(model.contains(createResource(personURI), VCARD.FN, createStringLiteral("John Smith")))
            }

            val delta = createDefaultModel().apply {
                createResource(personURI)
                        .addProperty(VCARD.FN, "William Shakespeare")
            }

            with(handleRequest(HttpMethod.Patch, "/statements") {
                addHeader(HttpHeaders.ContentType, JSONLD)
                setBody(delta.toString(RDFFormat.JSONLD))
            }) {
                assertEquals(HttpStatusCode.NoContent, response.status())
            }

            with(handleRequest(HttpMethod.Get, "/statements") {
                addHeader(HttpHeaders.Accept, JSONLD)
            }) {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals(JSONLD, response.headers[HttpHeaders.ContentType])
                val model = RDFFormat.JSONLD.parse(response.content!!)
                assertFalse(model.contains(createResource(personURI), VCARD.FN, createStringLiteral("John Smith")))
                assertTrue(model.contains(createResource(personURI), VCARD.FN, createStringLiteral("William Shakespeare")))
            }
        }
    }


    private fun <R> test(block: TestApplicationEngine.() -> R) {
        withTestApplication({
            (environment.config as MapApplicationConfig).put("authentication.jwt.enabled", "false")
            ceresModule()
        }, block)
    }
}

