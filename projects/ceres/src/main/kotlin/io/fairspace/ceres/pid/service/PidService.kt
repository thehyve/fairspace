package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import org.apache.commons.codec.digest.DigestUtils.md5Hex
import org.springframework.stereotype.Service

@Service
class PidService(val repository: PidRepository) {
    fun findById(id: String) =
            repository.findById(id) ?: throw MappingNotFoundException("ID not found: $id")


    fun findByValue(value: String) =
            repository.findByValue(value)
                    ?: throw MappingNotFoundException("Value not found: $value")


    fun findByValueStartingWith(prefix: String) =
            repository.findByValueStartingWith(prefix)

    fun findOrCreateByValue(uriPrefix: String, value: String) =
            repository.findByValue(value) ?: repository.save(Pid(uriPrefix + md5Hex(value), value))

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

    fun deleteByValueStartingWith(prefix: String) =
            repository.deleteByValueStartingWith(prefix)
}
