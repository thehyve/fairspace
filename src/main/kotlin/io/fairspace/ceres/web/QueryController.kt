package io.fairspace.ceres.web

import io.fairspace.ceres.repository.ModelRepository
import org.apache.jena.rdf.model.Model
import org.apache.jena.shared.NotFoundException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/query")
class QueryController(val repository: ModelRepository) {
    @GetMapping(produces = arrayOf("application/sparql-results+json", "application/ld+json"))
    fun get(@RequestParam("query") query: String): Any = repository.query(query)

    @PostMapping(produces = arrayOf("application/sparql-results+json", "application/ld+json"))
    fun post(@RequestBody query: String): Any = repository.query(query)
}