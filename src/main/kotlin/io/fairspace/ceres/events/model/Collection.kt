package io.fairspace.ceres.events.model

import java.net.URI

data class Collection(
    val id: Long = 0,
    val type: String = "",
    val location: String = "",
    val name: String = "",
    val description: String? = null,
    val uri: URI = CollectionConstants.DEFAULT_URI,
    val access: String = "None"
)

object CollectionConstants {
    val DEFAULT_URI = URI("http://fairspace.io")
}
