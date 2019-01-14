package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.exception.ValueAlreadyExistsException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class PidService(val repository: PidRepository) {
    fun findById(id: String) =
            repository.findById(id) ?: throw MappingNotFoundException("ID not found: $id")


    fun findByValue(value: String) =
            repository.findByValue(value)
                    ?: throw MappingNotFoundException("Value not found: $value")


    fun findByPrefix(prefix: String) =
            repository.findByValueStartingWith(prefix)

    fun findOrCreateByValue(prefix: String, value: String) =
            repository.findByValue(value) ?: repository.save(Pid(prefix + UUID.randomUUID(), value))

    fun updateByPrefix(oldPrefix: String, newPrefix: String) {
        repository.saveAll(
                repository.findByValueStartingWith(oldPrefix)
                        .map { it.copy(value = it.value.replaceFirst(oldPrefix, newPrefix)) }
        )
    }

    fun deleteById(id: String) =
            repository.deleteById(id)

    fun deleteByValue(value: String) =
            repository.deleteByValue(value)

    fun deleteByPrefix(prefix: String) =
            repository.deleteByValueStartingWith(prefix)
}
