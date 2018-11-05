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

    fun findByPrefix (prefix: String): List<Pid> =
            repository.findByValueStartingWith(prefix).toList()

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

    fun updateByPrefix (oldPrefix: String, newPrefix: String) : List<Pid> {
        var result: MutableList<Pid> = mutableListOf()
        for ( pid : Pid in findByPrefix(oldPrefix)) {
            val newValue: String = pid.value.replaceFirst(oldPrefix,newPrefix)
            if ( newValue.equals(pid.value)) {
                throw Exception("Internal error: unable to change prefix for value ${pid.value}")
            }
            pid.value = newValue
            result.add(repository.save(pid))
        }
        return result
    }

    fun delete (id : UUID) {
        repository.deleteById(id)
    }

    fun delete (value: String) {
        val foundPid : Pid = findByValue(value)
        repository.delete(foundPid)
    }

    fun deleteByPrefix (prefix: String) =
        repository.deleteByValueStartingWith(prefix)

}
