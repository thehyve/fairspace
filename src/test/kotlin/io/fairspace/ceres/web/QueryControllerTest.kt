package io.fairspace.ceres.web

import io.fairspace.ceres.TestData
import io.fairspace.ceres.repository.ModelRepository
import io.fairspace.ceres.repository.parse
import io.fairspace.ceres.repository.toString
import io.fairspace.ceres.web.converters.ResultSetConverter
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.apache.jena.riot.RDFFormat
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@WebMvcTest(secure = false)
class QueryControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var modelRepository: ModelRepository

    val JSON_LD = RDFFormat.JSONLD.lang.headerString
    val SPARQL = ResultSetConverter.SPARQL_RESULTS

    @Before
    fun setUp() {
        `when`(modelRepository.query("model")).thenReturn(TestData.model)
        `when`(modelRepository.query("sparql")).thenReturn(TestData.resultset)
    }

    @Test
    fun testGetModel() {
        this.mockMvc
                .perform(get("/query?query=model").accept(JSON_LD))
                .andExpect(status().isOk())
                .andExpect(content().contentType(JSON_LD))
                .andExpect { result ->
                    val model = RDFFormat.JSONLD.parse(result.response.contentAsString)
                    assertFalse(TestData.model == model)
                    assertTrue(TestData.model.isIsomorphicWith(model))
                }
    }

    @Test
    fun testGetSparql() {
        this.mockMvc
                .perform(get("/query?query=sparql").accept(SPARQL))
                .andExpect(status().isOk())
                .andExpect(content().contentType(SPARQL))
    }

    @Test
    fun testGetOtherAcceptHeader() {
        this.mockMvc
                .perform(get("/query?query=model"))
                .andExpect(status().isNotAcceptable())

        this.mockMvc
                .perform(get("/query?query=model").accept("application/json"))
                .andExpect(status().isNotAcceptable())

        // Sparql result does not serialize to JSON_LD or the other way around
        this.mockMvc
                .perform(get("/query?query=sparql").accept(JSON_LD))
                .andExpect(status().isNotAcceptable())
        this.mockMvc
                .perform(get("/query?query=model").accept(SPARQL))
                .andExpect(status().isNotAcceptable())
    }

    @Test
    fun testPostModel() {
        this.mockMvc
                .perform(post("/query").accept(JSON_LD).content("model"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(JSON_LD))
                .andExpect { result ->
                    val model = RDFFormat.JSONLD.parse(result.response.contentAsString)
                    assertFalse(TestData.model == model)
                    assertTrue(TestData.model.isIsomorphicWith(model))
                }
    }

    @Test
    fun testPostSparql() {
        this.mockMvc
                .perform(post("/query").accept(SPARQL).content("sparql"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(SPARQL))
    }

    @Test
    fun testPostOtherAcceptHeader() {
        this.mockMvc
                .perform(post("/query").content("model"))
                .andExpect(status().isNotAcceptable())

        this.mockMvc
                .perform(post("/query").accept("application/json").content("model"))
                .andExpect(status().isNotAcceptable())

        // Sparql result does not serialize to JSON_LD or the other way around
        this.mockMvc
                .perform(post("/query").accept(JSON_LD).content("sparql"))
                .andExpect(status().isNotAcceptable())

        this.mockMvc
                .perform(post("/query").accept(SPARQL).content("model"))
                .andExpect(status().isNotAcceptable())
    }

}
