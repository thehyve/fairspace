package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertTrue
import org.apache.commons.codec.digest.DigestUtils.md5Hex
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
        doReturn(Pid("foundId", "/found"))
                .`when`(pidRepository).findById("foundId")

        assertEquals(pidService.findById("foundId").value, "/found")
    }

    @Test(expected = MappingNotFoundException::class)
    fun throwsExceptionIfMappingNotFound() {
        doReturn(null)
                .`when`(pidRepository).findById("notFoundUUID")

        pidService.findById("notFoundUUID")
    }

    @Test
    fun canFindEntityByValue() {
        val value = "/test"

        doReturn(Pid("id", value))
                .`when`(pidRepository).findByValue(value)

        assertTrue(pidService.findByValue(value).id.endsWith("id"))
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
        val uuid1 = "id1"
        val uuid2 = "id2"
        val uuid3 = "id3"
        val uuid4 = "id4"

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
        val existingPid = Pid("id", "stored-value");
        doReturn(existingPid).`when`(pidRepository).findByValue("value")

        val output = pidService.findOrCreateByValue("http://files/", "value")

        assertEquals(existingPid, output)
        verify(pidRepository, times(0)).save(ArgumentMatchers.any())
    }

    @Test
    fun testFindOrCreateByValueWithNewMapping() {
        val newPid = Pid("http://files/57112d58563bfa5ab52fedee81ee0d07", "new-value");
        doReturn(null).`when`(pidRepository).findByValue("new-value")
        doReturn(newPid).`when`(pidRepository).save(newPid)

        val output = pidService.findOrCreateByValue("http://files/","new-value")

        assertEquals(newPid, output)
        verify(pidRepository).save(ArgumentMatchers.argThat { it!!.value == "new-value" })
    }

    @Test
    fun `A new pid should be always created even if there'a already a a pid  that was initially associated with same value`() {
        val prefix = "http://files/"
        val oldId = prefix + md5Hex("value")
        val usedId = prefix + md5Hex("value1")
        val newId = prefix + md5Hex("value2")
        val newPid = Pid(newId, "value")
        doReturn(null).`when`(pidRepository).findByValue("value")
        doReturn(Pid(oldId, "overwritten value")).`when`(pidRepository).findById(oldId)
        doReturn(Pid(usedId, "another overwritten value")).`when`(pidRepository).findById(usedId)
        doReturn(newPid).`when`(pidRepository).save(newPid)

        val output = pidService.findOrCreateByValue(prefix,"value")

        assertEquals(newPid, output)
        verify(pidRepository).save(ArgumentMatchers.argThat { it!!.id == newId })
    }

}
