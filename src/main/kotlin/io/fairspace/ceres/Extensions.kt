package io.fairspace.ceres

import io.ktor.application.ApplicationEnvironment

operator fun ApplicationEnvironment.get(path: String): String = config.property(path).getString()