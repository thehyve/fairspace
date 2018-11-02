package io.fairspace.ceres.pid.model

import java.util.*
import javax.persistence.*

@Entity
data class Pid (
    @Id
    @GeneratedValue (strategy = GenerationType.AUTO)
    val uuid: UUID,

    @Column(nullable=false)
    var value: String
)
