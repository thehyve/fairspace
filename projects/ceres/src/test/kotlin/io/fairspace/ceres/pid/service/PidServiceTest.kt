package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertTrue
import org.apache.commons.lang3.RandomStringUtils
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class PidServiceTest {
    @Mock
    lateinit var pidRepository: PidRepository

    lateinit var pidService: PidService

    @Before
    fun setUp() {
        pidService = PidService(pidRepository)
     }

    @Test
    fun canFindEntityByUUID() {
        val foundUUID = RandomStringUtils.random(10)

        doReturn(Pid(foundUUID, "/found"))
                .`when`(pidRepository).findById(foundUUID)

        assertEquals(pidService.findById(foundUUID).value, "/found")
    }

    @Test(expected = MappingNotFoundException::class)
    fun throwsExceptionIfMappingNotFound() {
        val notFoundUUID = RandomStringUtils.random(10)

        doReturn(null)
                .`when`(pidRepository).findById(notFoundUUID)

        pidService.findById(notFoundUUID)
    }

    @Test
    fun canFindEntityByValue() {
        val uuid =  RandomStringUtils.random(10)
        val value = "/test"

        doReturn(Pid(uuid, value))
                .`when`(pidRepository).findByValue(value)

        assertTrue(pidService.findByValue(value).id.endsWith(uuid.toString()))
    }

    @Test(expected = MappingNotFoundException::class)
    fun throwsExceptionIfMappingNotFoundForValue() {
        val value = "/test"

        doReturn(null)
                .`when`(pidRepository).findByValue(value)

        pidService.findByValue(value)
    }

    @Test
    fun updateByPrefixUpdatesAll() {
        val uuid1 = RandomStringUtils.random(10)
        val uuid2 = RandomStringUtils.random(10)
        val uuid3 = RandomStringUtils.random(10)
        val uuid4 = RandomStringUtils.random(10)

        val input = listOf(
                Pid(uuid1, "/input-prefix/abcdef"),
                Pid(uuid2, "/input-prefix/input-prefix/input-prefix/input-prefix/"),
                Pid(uuid3, "/input-prefix/"),
                Pid(uuid4, "/input-prefix/very-long-another-input-prefix")
        )

        val expectedOutput = listOf(
                Pid(uuid1, "/output-prefix/abcdef"),
                Pid(uuid2, "/output-prefix/input-prefix/input-prefix/input-prefix/"),
                Pid(uuid3, "/output-prefix/"),
                Pid(uuid4, "/output-prefix/very-long-another-input-prefix")
        )


        doReturn(input).`when`(pidRepository).findByValueStartingWith("/input-prefix/")

        pidService.updateByPrefix("/input-prefix/", "/output-prefix/")

        verify(pidRepository).saveAll(expectedOutput)
    }

    @Test
    fun testFindOrCreateByValueWithExistingMapping() {
        val existingPid = Pid(RandomStringUtils.random(10), "stored-value");
        doReturn(existingPid).`when`(pidRepository).findByValue("value")

        val output = pidService.findOrCreateByValue("http://files", "value")

        assertEquals("stored-value", output.value)
        verify(pidRepository, times(0)).save(ArgumentMatchers.any())
    }

    @Test
    fun testFindOrCreateByValueWithNewMapping() {
        val newPid = Pid(RandomStringUtils.random(10), "stored-value");
        doReturn(null).`when`(pidRepository).findByValue("new-value")
        doReturn(newPid).`when`(pidRepository).save(any())

        val output = pidService.findOrCreateByValue("http://files","new-value")

        assertEquals("stored-value", output.value)
        verify(pidRepository).save(ArgumentMatchers.argThat { it!!.value == "new-value" })
    }

}
