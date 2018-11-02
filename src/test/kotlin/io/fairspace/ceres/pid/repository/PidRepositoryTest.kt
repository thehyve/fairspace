package io.fairspace.ceres.pid.repository


import io.fairspace.ceres.pid.TestData
import io.fairspace.ceres.pid.model.Pid
import org.junit.Assert.*
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

class PidRepositoryTest {

    @Autowired
    lateinit var pidRepository: PidRepository

    lateinit var saved_pid1: Pid
    lateinit var saved_pid2: Pid
    lateinit var saved_pid3: Pid

    @Before
    fun setUp() {
       saved_pid1 = pidRepository.save(TestData.path1)
       saved_pid2 = pidRepository.save(TestData.path2)
       saved_pid3 = pidRepository.save(TestData.path3)
    }

    @Test
    fun test_repository_has_two_entities() {
        assert(pidRepository.count().equals(3L))
    }

    @Test
    fun can_find_entity_by_uuid() {
        val foundPath = pidRepository.findById(saved_pid1.uuid)
        assert(foundPath.isPresent())
        assertEquals(foundPath.get().uuid,saved_pid1.uuid)
    }

    @Test
    fun entity_uuid_has_been_changed_on_save() {
        val foundPath = pidRepository.findById(saved_pid1.uuid)
        assert(foundPath.isPresent())
        assertNotEquals(foundPath.get().uuid,TestData.path1.uuid)
    }

    @Test
    fun can_find_entity_by_value() {
        val foundPath = pidRepository.findByValue(TestData.path1.value)
        assert(foundPath != null && foundPath.uuid.equals(saved_pid1.uuid) )
    }

    @Test
    fun can_delete_entity() {
        assert(pidRepository.findById(saved_pid3.uuid).isPresent())
        pidRepository.deleteById(saved_pid3.uuid)
        assertFalse(pidRepository.findById(saved_pid3.uuid).isPresent())
    }

    @Test
    fun can_save_entity () {
        val testValue = "https://workspace.test.fairway.app/iri/collections/789/foo/bat"
        val testId = UUID.fromString("af4bec86-5297-4521-89d7-13ca579f6fb2")

        val testPid: Pid = Pid( uuid = testId, value = testValue )

        assertNull(pidRepository.findByValue(testValue))
        val addedPath = pidRepository.save(testPid)
        val foundPid: Pid? = pidRepository.findByValue(testValue)
        assertNotNull(foundPid)
        assertEquals(addedPath!!.uuid,foundPid!!.uuid)
    }
}