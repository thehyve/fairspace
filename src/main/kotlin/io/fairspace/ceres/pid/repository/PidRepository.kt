package io.fairspace.ceres.pid.repository

import io.fairspace.ceres.pid.model.Pid
import org.springframework.data.repository.CrudRepository
import java.util.*

interface PidRepository: CrudRepository<Pid, UUID> {
    fun findByUri (uri: String): Pid?
}

