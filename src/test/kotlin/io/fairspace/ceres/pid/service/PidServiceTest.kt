package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.TestData
import io.fairspace.ceres.pid.TestData.path1
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import junit.framework.Assert.assertEquals
import junit.framework.Assert.assertFalse
import org.junit.Assert
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.junit4.SpringRunner
import java.util.*

@DataJpaTest
@RunWith(SpringRunner::class)
@SpringBootTest
@DirtiesContext

class PidServiceTest {
    @Autowired
    lateinit var pidRepository: PidRepository

    lateinit var pidService: PidService

    lateinit var savedPid1: Pid
    lateinit var savedPid2: Pid
    lateinit var savedPid3: Pid

    @Before
    fun setUp() {
        pidService = PidService(pidRepository)
        savedPid1 = pidService.add(TestData.path1)
        savedPid2 = pidService.add(TestData.path2)
        savedPid3 = pidService.add(TestData.path3)
    }

    @Test
    fun can_find_entity_by_uuid() {
        val foundPath = pidService.findById(savedPid1.uuid)
            assert(foundPath.uuid.equals(savedPid1.uuid))
    }

    @Test
    fun entity_uuid_has_been_changed_on_save() {
        val foundPath = pidService.findById(savedPid1.uuid)
        Assert.assertNotEquals(foundPath.uuid,path1.uuid)
    }

    @Test
    fun can_find_entity_by_value() {
        val foundPath = pidService.findByValue(TestData.path1.value)
        assertEquals(foundPath.uuid, savedPid1.uuid)
    }

    @Test
    fun can_find_entity_by_prefix() {
        val pids: List<Pid> = pidService.findByPrefix(TestData.commonPrefix)
        assert(pids.size == 2)
        assert(pids.contains(savedPid1))
        assert(pids.contains(savedPid2))
    }

    @Test
    fun entity_exists_by_value() {
        assert(pidService.existsByValue(TestData.path1.value))
    }

    @Test
    fun nonexistent_entity_does_not_exist() {
        assertFalse(pidService.existsByValue(TestData.nonExistingValue))
    }

    @Test
    fun can_delete_entity() {
        assert(pidRepository.findById(savedPid3.uuid).isPresent())
        pidService.delete(savedPid3.uuid)
        Assert.assertFalse(pidRepository.findById(savedPid3.uuid).isPresent())
    }

    @Test
    fun can_delete_entity_by_prefix() {
        val pid4 : Pid = Pid ( uuid = UUID.randomUUID(), value = TestData.deleteTestValue1 )
        val pid5 : Pid = Pid ( uuid = UUID.randomUUID(), value = TestData.deleteTestValue2 )
        val savedPid4 = pidRepository.save(pid4)
        val savedPid5 = pidRepository.save(pid5)
        assert(pidRepository.findById(savedPid1.uuid).isPresent())
        assert(pidRepository.findById(savedPid2.uuid).isPresent())
        assert(pidRepository.findById(savedPid4.uuid).isPresent())
        assert(pidRepository.findById(savedPid5.uuid).isPresent())
        pidService.deleteByPrefix(TestData.deleteTestPrefix)
        assert(pidRepository.findById(savedPid1.uuid).isPresent())
        assert(pidRepository.findById(savedPid2.uuid).isPresent())
        Assert.assertFalse(pidRepository.findById(savedPid4.uuid).isPresent())
        Assert.assertFalse(pidRepository.findById(savedPid5.uuid).isPresent())
    }

    @Test
    fun can_update_entity_by_prefix() {
        val pid4 : Pid = Pid ( uuid = UUID.randomUUID(), value = TestData.updateTestOldValue1 )
        val pid5 : Pid = Pid ( uuid = UUID.randomUUID(), value = TestData.updateTestOldValue2 )
        val savedPid4 = pidRepository.save(pid4)
        val savedPid5 = pidRepository.save(pid5)
        // Pid 4 and 5 should be updated. Pid 1 and 2 should be unchanged after the update.
        assert(pidRepository.findById(savedPid1.uuid).isPresent())
        assert(pidRepository.findById(savedPid2.uuid).isPresent())
        assert(pidRepository.findById(savedPid4.uuid).isPresent())
        assert(pidRepository.findById(savedPid5.uuid).isPresent())
        assertEquals(TestData.file1, pidRepository.findById(savedPid1.uuid).get().value)
        assertEquals(TestData.file2, pidRepository.findById(savedPid2.uuid).get().value)
        assertEquals(TestData.updateTestOldValue1,pidRepository.findById(savedPid4.uuid).get().value)
        assertEquals(TestData.updateTestOldValue2,pidRepository.findById(savedPid5.uuid).get().value)
        pidService.updateByPrefix(TestData.updateTestOldPrefix, TestData.updateTestNewPrefix)
        assert(pidRepository.findById(savedPid1.uuid).isPresent())
        assert(pidRepository.findById(savedPid2.uuid).isPresent())
        assert(pidRepository.findById(savedPid4.uuid).isPresent())
        assert(pidRepository.findById(savedPid5.uuid).isPresent())
        assertEquals(TestData.file1, pidRepository.findById(savedPid1.uuid).get().value)
        assertEquals(TestData.file2, pidRepository.findById(savedPid2.uuid).get().value)
        assertEquals(TestData.updateTestNewValue1,pidRepository.findById(savedPid4.uuid).get().value)
        assertEquals(TestData.updateTestNewValue2,pidRepository.findById(savedPid5.uuid).get().value)
     }

    @Test
    fun can_save_entity () {
        val testValue = "https://workspace.test.fairway.app/iri/collections/789/foo/bat"
        val testId = UUID.fromString("af4bec86-5297-4521-89d7-13ca579f6fb2")

        val testPid: Pid = Pid( uuid = testId, value = testValue )

        Assert.assertNull(pidRepository.findByValue(testValue))
        val addedPath = pidService.add(testPid)
        val foundPid: Pid? = pidRepository.findByValue(testValue)
        Assert.assertNotNull(foundPid)
        assert(addedPath!!.uuid.equals(foundPid!!.uuid))
    }
}
