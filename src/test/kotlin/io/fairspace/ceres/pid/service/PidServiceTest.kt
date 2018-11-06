package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.TestData
import io.fairspace.ceres.pid.TestData.deleteTestPrefix
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertFalse
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner
import java.util.*



@RunWith(MockitoJUnitRunner::class)

class PidServiceTest {
    @Mock
    lateinit var pidRepository: PidRepository

    lateinit var pidService: PidService

    lateinit var savedPid1: Pid
    lateinit var savedPid2: Pid
    lateinit var savedPid3: Pid

    @Before
    fun setUp() {
        pidService = PidService(pidRepository)
     }

    @Test
    fun canFindEntityByUUID() {
        `when`(pidRepository.findById(TestData.path1.uuid)).thenReturn(Optional.of(TestData.path1))
        val foundPath = pidService.findById(TestData.path1.uuid)
            assert(foundPath.uuid.equals(TestData.path1.uuid))
    }

    @Test
    fun canFindEntityByValue() {
        `when`(pidRepository.findByValue(TestData.path1.value)).thenReturn(Optional.of(TestData.path1))
        val foundPath = pidService.findByValue(TestData.path1.value)
        assertEquals(foundPath.uuid, TestData.path1.uuid)
    }

    @Test
    fun canFindEntityByPrefix() {
        `when`(pidRepository.findByValueStartingWith(TestData.commonPrefix)).thenReturn(listOf(TestData.path1,TestData.path2))
        val pids: List<Pid> = pidService.findByPrefix(TestData.commonPrefix)
        verify(pidRepository,times(1)).findByValueStartingWith(TestData.commonPrefix)
        assert(pids.contains(TestData.path1))
        assert(pids.contains(TestData.path2))
    }

    @Test
    fun entityExistsByValue() {
        `when`(pidRepository.findByValue(TestData.path1.value)).thenReturn(Optional.of(TestData.path1))
        assert(pidService.existsByValue(TestData.path1.value))
    }

    @Test
    fun nonexistentEntityDoesNotExist() {
        `when`(pidRepository.findByValue(TestData.nonExistingValue)).thenReturn(Optional.empty())
        assertFalse(pidService.existsByValue(TestData.nonExistingValue))
    }

    @Test
    fun canDeleteEntity() {
       `when`(pidRepository.deleteById(TestData.path1.uuid)).then { null }
        pidService.delete(TestData.path1.uuid)
        verify(pidRepository,times(1)).deleteById(TestData.path1.uuid)
    }

    @Test
    fun canDeleteEntityByPrefix() {
        `when`(pidRepository.deleteByValueStartingWith(deleteTestPrefix)).then { null }
        pidService.deleteByPrefix(TestData.deleteTestPrefix)
        verify(pidRepository,times(1)).deleteByValueStartingWith(deleteTestPrefix)
    }

    @Test
    fun canUpdateEntityByPrefix() {
        `when`(pidRepository.findByValueStartingWith(TestData.commonPrefix)).thenReturn(listOf(TestData.path1))
        `when`(pidRepository.save(TestData.path1)).thenReturn(TestData.path1)
        val results: List<Pid> = pidService.updateByPrefix(TestData.commonPrefix, TestData.updateTestNewPrefix)
        verify(pidRepository,times(1)).findByValueStartingWith(TestData.commonPrefix)
        verify(pidRepository,times(1)).save(Mockito.any())
        assert(results.size == 1 )
     }

    @Test
    fun canSaveEntity () {
        val testValue = "https://workspace.test.fairway.app/iri/collections/789/foo/bat"
        val testId = UUID.fromString("af4bec86-5297-4521-89d7-13ca579f6fb2")
        val testPid = Pid( uuid = testId, value = testValue )
        `when`(pidRepository.save(testPid)).thenReturn(testPid)
        pidService.add(testPid)
        verify(pidRepository, times(1)).save(testPid)
    }
}
