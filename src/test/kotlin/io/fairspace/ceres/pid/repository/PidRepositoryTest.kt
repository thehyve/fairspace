package io.fairspace.ceres.pid.repository


import io.fairspace.ceres.pid.model.Pid
import org.junit.Assert.assertEquals
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

    @Before
    fun setUp() {
       pidRepository.save(Pid(UUID.randomUUID(), "prefix1/abc"))
       pidRepository.save(Pid(UUID.randomUUID(), "prefix1"))
       pidRepository.save(Pid(UUID.randomUUID(), "prefix2/abc"))
       pidRepository.save(Pid(UUID.randomUUID(), "prefix2/prefix1"))
       pidRepository.save(Pid(UUID.randomUUID(), ""))
    }

    @Test
    fun testPrefixList() {
        val pids = pidRepository.findByValueStartingWith("prefix1").toList()
        val values = pids.map { p -> p.value }

        assertEquals(2, pids.size)
        assert(values.contains("prefix1/abc"))
        assert(values.contains("prefix1"))
    }

    @Test
    fun testPrefixDeletion() {
        assertEquals(5, pidRepository.findAll().toList().size)

        pidRepository.deleteByValueStartingWith("prefix1")

        val pids = pidRepository.findAll().toList()
        val values = pids.map { p -> p.value }

        assertEquals(3, pids.size)
        assert(!values.contains("prefix1/abc"))
        assert(!values.contains("prefix1"))
    }
}
