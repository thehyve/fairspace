package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.InvalidPersistentIdentifierException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.model.PidDTO
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*

@Component
class PidConverter(
        @Value("\${app.metadata.base-url}") val urlPrefix: String,
        @Value("\${app.metadata.infix}") val urlInfix: String
) {
    val prefix get() = ensureTrailingSlashOrEmpty(urlPrefix) + ensureTrailingSlashOrEmpty(urlInfix)

    fun pidToPidDTO(pid: Pid): PidDTO {
        return PidDTO(id = uuidToId(pid.uuid), value = pid.value)
    }

    fun idToUUID(input: String): UUID {
        if (input.startsWith(prefix)) {
            val uuidString: String = input.replaceFirst(prefix, "")
            try {
                return UUID.fromString(uuidString)
            } catch (_: IllegalArgumentException) {
                throw InvalidPersistentIdentifierException("No UUID specified in uri: " + input)
            }
        } else {
            throw InvalidPersistentIdentifierException("Unknown prefix in uri: " + input)
        }
    }

    fun uuidToId(input: UUID): String {
        return prefix + input
    }

    private fun ensureTrailingSlashOrEmpty(input: String) =
            if(input.isNotBlank())
                input + (if(input.takeLast(1) == "/") "" else "/")
            else
                ""
}
