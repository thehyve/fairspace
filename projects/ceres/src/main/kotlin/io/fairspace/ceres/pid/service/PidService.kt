package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.exception.ValueAlreadyExistsException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class PidService(val repository: PidRepository, val pidConverter: PidConverter) {
    fun findById(id: String) =
            pidConverter.pidToPidDTO(
                    repository.findById(pidConverter.idToUUID(id))
                            .orElseThrow { MappingNotFoundException("ID not found: $id") }
            )

    fun findByValue(value: String) =
            pidConverter.pidToPidDTO(
                    repository.findByValue(value)
                            .orElseThrow { MappingNotFoundException("Value not found: $value") }
            )

    fun findByPrefix(prefix: String) =
            repository.findByValueStartingWith(prefix).toList()
                    .map { pid -> pidConverter.pidToPidDTO(pid) }

    fun findOrCreateByValue(value: String) =
            pidConverter.pidToPidDTO(_findOrCreateByValue(value))

    fun updateByPrefix(oldPrefix: String, newPrefix: String): MutableIterable<Pid> =
            repository.saveAll(
                    repository.findByValueStartingWith(oldPrefix)
                            .map { it.copy(value = it.value.replaceFirst(oldPrefix, newPrefix)) }
            )

    fun deleteById(id: String) =
            repository.deleteById(pidConverter.idToUUID(id))

    fun deleteByValue(value: String) =
            repository.deleteByValue(value)

    fun deleteByPrefix(prefix: String) =
            repository.deleteByValueStartingWith(prefix)

    private fun _add(value: String): Pid {
        try {
            return repository.save(Pid(UUID.randomUUID(), value))
        } catch (_: Exception) {
            throw ValueAlreadyExistsException("Value already exists: " + value)
        }
    }

    private fun _findOrCreateByValue(value: String) =
            repository.findByValue(value).orElseGet { _add(value) }
}
