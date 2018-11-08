package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.model.PidDTO
import io.fairspace.ceres.pid.repository.PidRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*

@Service
class PidService(val repository: PidRepository) {

    companion object {
        @Value("\${app.metadata.base-url}")
        lateinit var urlPrefix: String
    }

    fun findById (id: String) : PidDTO {
        val pid : Optional<Pid> = repository.findById(idToUUID(id))
        if (pid.isPresent()) {
            return pidToPidDTO(pid.get())
        }
        else {
            throw MappingNotFoundException(id.toString())
        }
    }

    fun findByValue (value: String) : PidDTO {
        val pid : Optional<Pid> = repository.findByValue(value)
        if (pid.isPresent()) {
            return pidToPidDTO(pid.get())
        }
        else {
            throw MappingNotFoundException(value)
        }
    }

    fun findByPrefix (prefix: String): List<PidDTO> =
        repository.findByValueStartingWith(prefix).toList().map { pid -> pidToPidDTO(pid) }

    fun existsByValue(value: String): Boolean {
        try {
            findByValue(value)
        }
        catch (mnfe: MappingNotFoundException) {
            return false
        }
        return true
    }

    fun add (pidDTO: PidDTO, errorAlreadyExists: Boolean = false) : Pid {
        val pid = pidDTOtoPid(pidDTO)
        if ( errorAlreadyExists && existsByValue(pid.value)) {
            throw ValueAlreadyExistsException("value: ${pid.value}")
        }
        else {
            return repository.save(pid)
        }
    }

    fun updateByPrefix (oldPrefix: String, newPrefix: String) : List<Pid> {
        var result: MutableList<Pid> = mutableListOf()
        for ( pidDTO : PidDTO in findByPrefix(oldPrefix)) {
            val pid = pidDTOtoPid(pidDTO)
            if ( pid.value.indexOf(oldPrefix) != 0) {
                throw Exception("Internal error: unable to change prefix for value ${pid.value}")
            }
            val newValue: String = pid.value.replaceFirst(oldPrefix,newPrefix)
            pid.value = newValue
            result.add(repository.save(pid))
        }
        return result
    }

    fun deleteById (id: String) {
        repository.deleteById(idToUUID(id))
    }

    fun deleteByValue  (value: String) {
        val foundPid : Pid = pidDTOtoPid (findByValue(value))
        repository.delete(foundPid)
    }

    fun deleteByPrefix (prefix: String) =
        repository.deleteByValueStartingWith(prefix)
}