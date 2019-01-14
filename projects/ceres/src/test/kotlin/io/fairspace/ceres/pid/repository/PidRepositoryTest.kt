package io.fairspace.ceres.pid.repository


import io.fairspace.ceres.CeresApplication
import io.fairspace.ceres.pid.model.Pid
import org.apache.commons.lang3.RandomStringUtils
import org.apache.jena.query.DatasetFactory
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
import java.util.*

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
    lateinit var pidRepository: PidRepository

    @Before
    fun setUp() {
        pidRepository.deleteByValueStartingWith("")
       pidRepository.save(Pid(RandomStringUtils.random(10), "prefix1/abc"))
       pidRepository.save(Pid(RandomStringUtils.random(10), "prefix1"))
       pidRepository.save(Pid(RandomStringUtils.random(10), "prefix2/abc"))
       pidRepository.save(Pid(RandomStringUtils.random(10), "prefix2/prefix1"))
       pidRepository.save(Pid(RandomStringUtils.random(10), ""))
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
        assertEquals(5, pidRepository.findAll().size)

        pidRepository.deleteByValueStartingWith("prefix1")

        val pids = pidRepository.findAll().toList()
        val values = pids.map { p -> p.value }

        assertEquals(3, pids.size)
        assert(!values.contains("prefix1/abc"))
        assert(!values.contains("prefix1"))
    }
}
