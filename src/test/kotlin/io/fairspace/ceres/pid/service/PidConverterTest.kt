package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.InvalidPersistentIdentifierException
import io.fairspace.ceres.pid.model.Pid
import junit.framework.TestCase.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.junit.MockitoJUnitRunner
import java.util.*

@RunWith(MockitoJUnitRunner::class)
class PidConverterTest {
    lateinit var pidConverter: PidConverter

    @Before
    fun setUp() {
        pidConverter = PidConverter("http://test-prefix/", "iri/files")
    }

    @Test
    fun testToDTO() {
        val input = Pid(UUID.randomUUID(), "/value/xyz")
        val output= pidConverter.pidToPidDTO(input)

        assertEquals("http://test-prefix/iri/files/" + input.uuid, output.id)
        assertEquals(output.value, input.value)
    }

    @Test
    fun testToUUID() {
        val uuid = UUID.randomUUID()

        assertEquals(uuid, pidConverter.idToUUID("http://test-prefix/iri/files/" + uuid))
    }

    @Test(expected = InvalidPersistentIdentifierException::class)
    fun testToUUIDWithInvalidPrefix() {
        val uuid = UUID.randomUUID()
        pidConverter.idToUUID("http://invalid-prefix/" + uuid)
    }

    @Test(expected = InvalidPersistentIdentifierException::class)
    fun testToUUIDWithoutUUID() {
        pidConverter.idToUUID("http://test-prefix/no-uuid")
    }

    @Test
    fun testToIdentifier() {
        val uuid = UUID.randomUUID()
        assertEquals("http://test-prefix/iri/files/" + uuid, pidConverter.uuidToId(uuid))
    }

    @Test
    fun testMissingPrefix() {
        val uuid = UUID.randomUUID()

        pidConverter = PidConverter("http://test-prefix/", "")
        assertEquals("http://test-prefix/" + uuid, pidConverter.uuidToId(uuid))
    }

    @Test
    fun testMissingSlashes() {
        val uuid = UUID.randomUUID()

        pidConverter = PidConverter("http://test-prefix", "")
        assertEquals("http://test-prefix/" + uuid, pidConverter.uuidToId(uuid))

        pidConverter = PidConverter("http://test-prefix", "infix")
        assertEquals("http://test-prefix/infix/" + uuid, pidConverter.uuidToId(uuid))

        pidConverter = PidConverter("http://test-prefix/", "infix")
        assertEquals("http://test-prefix/infix/" + uuid, pidConverter.uuidToId(uuid))

        pidConverter = PidConverter("http://test-prefix/", "infix/")
        assertEquals("http://test-prefix/infix/" + uuid, pidConverter.uuidToId(uuid))

    }

}
