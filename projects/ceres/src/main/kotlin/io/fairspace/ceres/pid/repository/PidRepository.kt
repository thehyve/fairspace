package io.fairspace.ceres.pid.repository

import io.fairspace.ceres.pid.model.Pid
import org.springframework.data.repository.CrudRepository
import java.util.*

interface PidRepository : CrudRepository<Pid, UUID> {
    fun findByValue(value: String): Optional<Pid>
    fun findByValueStartingWith(prefix: String): Iterable<Pid>

    fun deleteByValue(value: String)
    fun deleteByValueStartingWith(prefix: String)
}

