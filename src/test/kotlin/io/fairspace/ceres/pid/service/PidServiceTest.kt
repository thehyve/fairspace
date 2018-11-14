package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner
import java.util.*

@RunWith(MockitoJUnitRunner::class)
class PidServiceTest {
    @Mock
    lateinit var pidRepository: PidRepository

    lateinit var pidService: PidService

    @Before
    fun setUp() {
        pidService = PidService(pidRepository, PidConverter("http://service-test/"))
     }

    @Test
    fun canFindEntityByUUID() {
        val foundUUID = UUID.randomUUID()

        doReturn(Optional.of(Pid(foundUUID, "/found")))
                .`when`(pidRepository).findById(foundUUID)

        assertEquals(pidService.findById("http://service-test/" + foundUUID).value, "/found")
    }

    @Test(expected = MappingNotFoundException::class)
    fun throwsExceptionIfMappingNotFound() {
        val notFoundUUID = UUID.randomUUID()

        doReturn(Optional.empty<Pid>())
                .`when`(pidRepository).findById(notFoundUUID)

        pidService.findById("http://service-test/" + notFoundUUID)
    }

    @Test
    fun canFindEntityByValue() {
        val uuid =UUID.randomUUID()
        val value = "/test"

        doReturn(Optional.of(Pid(uuid, value)))
                .`when`(pidRepository).findByValue(value)

        assertTrue(pidService.findByValue(value).id.endsWith(uuid.toString()))
    }

    @Test(expected = MappingNotFoundException::class)
    fun throwsExceptionIfMappingNotFoundForValue() {
        val value = "/test"

        doReturn(Optional.empty<Pid>())
                .`when`(pidRepository).findByValue(value)

        pidService.findByValue(value)
    }

    @Test
    fun updateByPrefixUpdatesAll() {
        val uuid1 = UUID.randomUUID()
        val uuid2 = UUID.randomUUID()
        val uuid3 = UUID.randomUUID()
        val uuid4 = UUID.randomUUID()

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
        val existingPid = Pid(UUID.randomUUID(), "stored-value");
        doReturn(Optional.of(existingPid)).`when`(pidRepository).findByValue("value")

        val output = pidService.findOrCreateByValue("value")

        assertEquals("stored-value", output.value)
        verify(pidRepository, times(0)).save(ArgumentMatchers.any())
    }

    @Test
    fun testFindOrCreateByValueWithNewMapping() {
        val newPid = Pid(UUID.randomUUID(), "stored-value");
        doReturn(Optional.empty<Pid>()).`when`(pidRepository).findByValue("new-value")
        doReturn(newPid).`when`(pidRepository).save(any())

        val output = pidService.findOrCreateByValue("new-value")

        assertEquals("stored-value", output.value)
        verify(pidRepository).save(ArgumentMatchers.argThat { it.value == "new-value" })
    }

}
