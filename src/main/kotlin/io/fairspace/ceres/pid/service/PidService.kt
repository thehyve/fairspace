package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class PidService(val repository: PidRepository) {

    fun findById (id: UUID) : Pid =
            repository.findById(id).orElseThrow({MappingNotFoundException(id.toString())})

    fun findByValue (value: String) : Pid =
        repository.findByValue(value) ?: throw MappingNotFoundException(value)

    fun existsByValue(value: String): Boolean {
        try {
            findByValue(value)
        }
        catch (mnfe: MappingNotFoundException) {
            return false
        }
        return true
    }

    fun add (pid: Pid, errorAlreadyExists: Boolean = false) : Pid {
        if ( errorAlreadyExists && existsByValue(pid.value)) {
            throw ValueAlreadyExistsException("value: ${pid.value}")
        }
        else {
            return repository.save(pid)
        }
    }

    fun delete (id : UUID) {
        repository.deleteById(id)
    }

    fun delete (value: String) {
        val foundPid : Pid = findByValue(value)
        repository.delete(foundPid)
    }

}
