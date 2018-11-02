package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.repository.PidRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class PidService(val repository: PidRepository) {

    fun findById (id: UUID) : Pid =
            repository.findById(id).orElseThrow({NotFoundException(id.toString())})

    fun findByValue (value: String) : Pid =
        repository.findByValue(value) ?: throw NotFoundException(value)


    fun add (pid: Pid, errorAlreadyExists: Boolean = false) : Pid {
        if ( errorAlreadyExists && repository.existsById(pid.uuid)) {
            throw Exception("Pid for UUID ${pid.uuid} already exists")
        }
        return repository.save(pid)
    }

    fun delete (id : UUID) {
        repository.deleteById(id)
    }

    fun delete (value: String) {
        val foundPid : Pid = findByValue(value)
        repository.delete(foundPid)
    }

}
