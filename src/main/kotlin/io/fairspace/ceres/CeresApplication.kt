package io.fairspace.ceres

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan

@SpringBootApplication
class CeresApplication

fun main(args: Array<String>) {
    runApplication<CeresApplication>(*args)
}
