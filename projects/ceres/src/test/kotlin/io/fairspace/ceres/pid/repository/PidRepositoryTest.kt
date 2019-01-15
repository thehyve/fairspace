package io.fairspace.ceres.pid.repository


import io.fairspace.ceres.CeresApplication
import io.fairspace.ceres.pid.model.Pid
import org.apache.jena.query.Dataset
import org.apache.jena.query.DatasetFactory.createTxnMem
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
@DirtiesContext
open class PidRepositoryTest {
    @Configuration
    @Import(CeresApplication::class)
    class TestConfig {
        @Bean
        fun dataset() = createTxnMem()
    }

    @Autowired
    lateinit var ds: Dataset

    @Autowired
    lateinit var pidRepository: PidRepository

    @Before
    fun setUp() {
        ds.defaultModel.removeAll()
        pidRepository.save(Pid("1", "prefix1/abc"))
        pidRepository.save(Pid("2", "prefix1"))
        pidRepository.save(Pid("3", "prefix123"))
        pidRepository.save(Pid("4", "prefix2/abc"))
        pidRepository.save(Pid("5", "prefix2/prefix1"))
        pidRepository.save(Pid("6", ""))
    }

    @Test
    fun testPrefixList() {
        val pids = pidRepository.findByValueStartingWith("prefix1")
        val values = pids.map { p -> p.value }

        assertEquals(2, pids.size)
        assert(values.contains("prefix1/abc"))
        assert(values.contains("prefix1"))
    }

    @Test
    fun testPrefixDeletion() {
        assertEquals(6, pidRepository.findAll().size)

        pidRepository.deleteByValueStartingWith("prefix1")

        val pids = pidRepository.findAll().toList()
        val values = pids.map { p -> p.value }

        assertEquals(4, pids.size)
        assert(!values.contains("prefix1/abc"))
        assert(!values.contains("prefix1"))
    }
}
