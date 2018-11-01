package io.fairspace.ceres.pid.service

import io.fairspace.ceres.pid.model.Path
import io.fairspace.ceres.pid.repository.PidRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class PidService(val repository: PidRepository) {

    fun findById (id: UUID) : Path =
            repository.findById(id).orElseThrow({NotFoundException(id.toString())})

    fun findByUri (uri: String) : Path =
        repository.findByUri(uri) ?: throw NotFoundException(uri)


    fun add ( path: Path, errorAlreadyExists: Boolean = false) : Path {
        if ( errorAlreadyExists && repository.existsById(path.uuid)) {
            throw Exception("Path for UUID ${path.uuid} already exists")
        }
        return repository.save(path)
    }

    fun delete (id : UUID) {
        repository.deleteById(id)
    }

    fun delete (uri: String) {
        val foundPath : Path = findByUri(uri)
        repository.delete(foundPath)
    }

}
