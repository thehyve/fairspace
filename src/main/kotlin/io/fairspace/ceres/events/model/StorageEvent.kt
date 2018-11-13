package io.fairspace.ceres.events.model

data class StorageEvent(
    val path: String = "",
    val type: PathType = PathType.UNKNOWN,
    val contentLength: Long? = null,
    val destination: String? = null,
    val collection: Collection? = null
)

enum class PathType {
    UNKNOWN,
    FILE,
    DIRECTORY;
}
