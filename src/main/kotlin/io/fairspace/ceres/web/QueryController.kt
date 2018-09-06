package io.fairspace.ceres.web

import io.fairspace.ceres.repository.ModelRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/query")
class QueryController(val repository: ModelRepository) {
    @GetMapping(produces = ["application/sparql-results+json", "application/ld+json", "application/json"])
    fun get(@RequestParam("query") query: String): Any = repository.query(query)

    @PostMapping(produces = ["application/sparql-results+json", "application/ld+json", "application/json"])
    fun post(@RequestBody query: String): Any = repository.query(query)
}
