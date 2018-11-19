package io.fairspace.ceres.pid.web

import io.fairspace.ceres.pid.exception.InvalidPersistentIdentifierException
import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.exception.ValueAlreadyExistsException
import io.fairspace.ceres.pid.model.PidDTO
import io.fairspace.ceres.pid.service.PidService
import org.hamcrest.Matchers.`is`
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath

@RunWith(SpringRunner::class)
@WebMvcTest(secure = false, controllers = [PidController::class])
class PidControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var pidService: PidService

    val pidDtoById = PidDTO("http://id", "by-id")
    val pidDtoByValue = PidDTO("http://value", "by-value")

    @Before
    fun setUp() {
        `when`(pidService.findById("some")).thenReturn(pidDtoById)
        `when`(pidService.findByValue("some")).thenReturn(pidDtoByValue)
    }

    @Test
    fun testGetById() {
        this.mockMvc
                .perform(MockMvcRequestBuilders.get("/pid?id=some"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(jsonPath("$.id", `is`("http://id")))
                .andExpect(jsonPath("$.value", `is`("by-id")))
    }

    @Test
    fun testGetByValue() {
        this.mockMvc
                .perform(MockMvcRequestBuilders.get("/pid?value=some"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(jsonPath("$.id", `is`("http://value")))
                .andExpect(jsonPath("$.value", `is`("by-value")))
    }

    @Test
    fun testGetWithoutArguments() {
        this.mockMvc
                .perform(MockMvcRequestBuilders.get("/pid"))
                .andExpect(MockMvcResultMatchers.status().is4xxClientError())
    }

    @Test
    fun testDeleteById() {
        this.mockMvc
                .perform(MockMvcRequestBuilders.delete("/pid?id=some"))
                .andExpect(MockMvcResultMatchers.status().isOk())

        verify(pidService).deleteById("some")
    }

    @Test
    fun testDeleteByValue() {
        this.mockMvc
                .perform(MockMvcRequestBuilders.delete("/pid?value=some"))
                .andExpect(MockMvcResultMatchers.status().isOk())

        verify(pidService).deleteByValue("some")
    }

    @Test
    fun testDeleteWithoutArguments() {
        this.mockMvc
                .perform(MockMvcRequestBuilders.delete("/pid"))
                .andExpect(MockMvcResultMatchers.status().is4xxClientError())
    }

    @Test
    fun testMappingNotFoundException() {
        `when`(pidService.findById("exception")).thenThrow(MappingNotFoundException("test"))
        this.mockMvc
                .perform(MockMvcRequestBuilders.get("/pid?id=exception"))
                .andExpect(MockMvcResultMatchers.status().is4xxClientError())
    }

    @Test
    fun testValueAlreadyExistsException() {
        `when`(pidService.findById("exception")).thenThrow(ValueAlreadyExistsException("test"))
        this.mockMvc
                .perform(MockMvcRequestBuilders.get("/pid?id=exception"))
                .andExpect(MockMvcResultMatchers.status().is4xxClientError())
    }

    @Test
    fun testInvalidPersistentIdentifierException() {
        `when`(pidService.findById("exception")).thenThrow(InvalidPersistentIdentifierException("test"))
        this.mockMvc
                .perform(MockMvcRequestBuilders.get("/pid?id=exception"))
                .andExpect(MockMvcResultMatchers.status().is4xxClientError())
    }


}
