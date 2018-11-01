package io.fairspace.ceres.pid.model

import java.util.*
import javax.persistence.*

@Entity
data class Path (
    @Id
    @GeneratedValue (strategy = GenerationType.AUTO)
    val uuid: UUID,

    @Column(nullable=false)
    val uri: String
)
