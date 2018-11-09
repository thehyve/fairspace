package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.InvalidPersistentIdentifierException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.model.PidDTO
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*

@Component
class PidConverter(@Value("\${app.metadata.base-url}") val urlPrefix: String) {
    fun pidToPidDTO(pid: Pid): PidDTO {
        return PidDTO(id = uuidToId(pid.uuid), value = pid.value)
    }

    fun idToUUID(input: String): UUID {
        if (input.startsWith(urlPrefix)) {
            val uuidString: String = input.replaceFirst(urlPrefix, "")
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
        return urlPrefix + input
    }
}
