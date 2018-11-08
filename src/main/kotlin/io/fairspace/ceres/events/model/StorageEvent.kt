package io.fairspace.ceres.events.model

data class StorageEvent(
    val path: String = "",
    val contentLength: Long? = null,
    val destination: String? = null,
    val collection: Collection? = null
)
