package io.fairspace.ceres.pid.repository

import io.fairspace.ceres.pid.model.Path
import org.springframework.data.repository.CrudRepository
import java.util.*

interface PidRepository: CrudRepository<Path, UUID> {
    fun findByUri (uri: String): Path?
}

