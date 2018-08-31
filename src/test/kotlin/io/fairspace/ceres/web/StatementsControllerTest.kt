package io.fairspace.ceres.web

import io.fairspace.ceres.TestData
import io.fairspace.ceres.repository.ModelRepository
import io.fairspace.ceres.repository.parse
import io.fairspace.ceres.repository.toString
import org.apache.jena.riot.RDFFormat
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
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
class StatementsControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var modelRepository: ModelRepository

    val JSON_LD = RDFFormat.JSONLD.lang.headerString

    @Test
    fun testGet() {
        val subject = TestData.personURI
        `when`(modelRepository.list(subject, null)).thenReturn(TestData.model)

        // Happy flow
        this.mockMvc
                .perform(get("/statements?subject=" + subject).accept(JSON_LD))
                .andExpect(status().isOk())
                .andExpect(content().contentType(JSON_LD))
                .andExpect { result ->
                    val model = RDFFormat.JSONLD.parse(result.response.contentAsString)
                    assertFalse(TestData.model == model)
                    assertTrue(TestData.model.isIsomorphicWith(model))
                }
    }

    @Test
    fun testGetOtherAcceptHeader() {
        val subject = TestData.personURI
        `when`(modelRepository.list(subject, null)).thenReturn(TestData.model)

        this.mockMvc
                .perform(get("/statements?subject=" + subject))
                .andExpect(status().isOk())
                .andExpect(content().contentType(JSON_LD))

        this.mockMvc
                .perform(get("/statements?subject=" + subject).accept("application/json"))
                .andExpect(status().isNotAcceptable())

    }

    @Test
    fun testPost() {
        this.mockMvc
                .perform(post("/statements")
                                .contentType(JSON_LD)
                                .content(TestData.model.toString(RDFFormat.JSONLD)))
                .andExpect(status().isNoContent())

    }

    @Test
    fun testPostOtherContentType() {
        // Happy flow
        this.mockMvc
                .perform(post("/statements")
                        .content(TestData.model.toString(RDFFormat.JSONLD)))
                .andExpect(status().isUnsupportedMediaType())

        this.mockMvc
                .perform(post("/statements")
                        .contentType("application/json")
                        .content(TestData.model.toString(RDFFormat.JSONLD)))
                .andExpect(status().isUnsupportedMediaType())
    }

    @Test
    fun testPostInvalidBody() {
        this.mockMvc
                .perform(post("/statements")
                        .contentType(JSON_LD)
                        .content("no-valid-json"))
                .andExpect(status().isBadRequest())
    }


    @Test
    fun testPatch() {
        this.mockMvc
                .perform(patch("/statements")
                        .contentType(JSON_LD)
                        .content(TestData.model.toString(RDFFormat.JSONLD)))
                .andExpect(status().isNoContent())
    }

    @Test
    fun testPatchOtherContentType() {
        // Happy flow
        this.mockMvc
                .perform(patch("/statements")
                        .content(TestData.model.toString(RDFFormat.JSONLD)))
                .andExpect(status().isUnsupportedMediaType())
    }

}
