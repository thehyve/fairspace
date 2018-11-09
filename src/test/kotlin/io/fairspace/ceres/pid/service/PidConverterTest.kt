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
        pidConverter = PidConverter("http://test-prefix/")
    }

    @Test
    fun testToDTO() {
        val input = Pid(UUID.randomUUID(), "/value/xyz")
        val output= pidConverter.pidToPidDTO(input)

        assertEquals(output.id, "http://test-prefix/" + input.uuid)
        assertEquals(output.value, input.value)
    }

    @Test
    fun testToUUID() {
        val uuid = UUID.randomUUID()

        assertEquals(uuid, pidConverter.idToUUID("http://test-prefix/" + uuid))
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
        assertEquals("http://test-prefix/" + uuid, pidConverter.uuidToId(uuid))
    }

}
