package io.fairspace.ceres.pid.repository


import io.fairspace.ceres.pid.TestData
import io.fairspace.ceres.pid.model.Path
import org.apache.jena.sparql.function.library.uuid
import org.aspectj.weaver.tools.cache.SimpleCacheFactory.path
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.junit.Before
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
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

    lateinit var saved_path1: Path
    lateinit var saved_path2: Path
    lateinit var saved_path3: Path

    @Before
    fun setUp() {
       saved_path1 = pidRepository.save(TestData.path1)
       saved_path2 = pidRepository.save(TestData.path2)
       saved_path3 = pidRepository.save(TestData.path3)
    }

    @Test
    fun test_repository_has_two_entities() {
        assert(pidRepository.count().equals(3L))
    }

    @Test
    fun can_find_entity_by_uuid() {
        val foundPath = pidRepository.findById(saved_path1.uuid)
        assert(foundPath.isPresent())
        assertEquals(foundPath.get().uuid,saved_path1.uuid)
    }

    @Test
    fun entity_uuid_has_been_changed_on_save() {
        val foundPath = pidRepository.findById(saved_path1.uuid)
        assert(foundPath.isPresent())
        assertNotEquals(foundPath.get().uuid,TestData.path1.uuid)
    }

    @Test
    fun can_find_entity_by_uri() {
        val foundPath = pidRepository.findByUri(TestData.path1.uri)
        assert(foundPath != null && foundPath.uuid.equals(saved_path1.uuid) )
    }

    @Test
    fun can_delete_entity() {
        assert(pidRepository.findById(saved_path3.uuid).isPresent())
        pidRepository.deleteById(saved_path3.uuid)
        assertFalse(pidRepository.findById(saved_path3.uuid).isPresent())
    }

    @Test
    fun can_save_entity () {
        val test_uri = "https://workspace.test.fairway.app/iri/collections/789/foo/bat"
        val test_uuid = UUID.fromString("af4bec86-5297-4521-89d7-13ca579f6fb2")

        val testPath: Path = Path( uuid = test_uuid, uri = test_uri )

        assertNull(pidRepository.findByUri(test_uri))
        val addedPath = pidRepository.save(testPath)
        val foundPath: Path? = pidRepository.findByUri(test_uri)
        assertNotNull(foundPath)
        assertEquals(addedPath!!.uuid,foundPath!!.uuid)
    }
}