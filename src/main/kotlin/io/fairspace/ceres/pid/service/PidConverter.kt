package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.model.PidDTO
import java.util.*

fun pidToPidDTO(pid: Pid): PidDTO {
    return PidDTO(id = uuidToId(pid.uuid), value = pid.value)
}

fun pidDTOtoPid(pidDTO: PidDTO): Pid {
    return Pid(uuid = idToUUID(pidDTO.id), value = pidDTO.value)
}

fun idToUUID(input: String): UUID {
    if (input.startsWith(PidService.urlPrefix)) {
        val uuidString: String = input.replaceFirst(PidService.urlPrefix, "")
        try {
            return UUID.fromString(uuidString)
        } catch (_: IllegalArgumentException) {
            throw InvalidPersistentIdentifierException(input)
        }
    } else {
        throw InvalidPersistentIdentifierException(input)
    }
}

fun uuidToId(input: UUID): String {
    return PidService.urlPrefix + input
}
