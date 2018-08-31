package io.fairspace.ceres.web

import io.fairspace.ceres.repository.ModelRepository
import org.apache.jena.rdf.model.Model
import org.apache.jena.shared.NotFoundException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/statements")
class StatementsController(val repository: ModelRepository) {

    @GetMapping(produces = arrayOf("application/ld+json"))
    fun get(@RequestParam("subject") subject: String, @RequestParam("predicate") predicate: String?): Model {
        return repository.list(subject, predicate)
    }

    @PostMapping(consumes = arrayOf("application/ld+json"))
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun post(@RequestBody delta: Model) {
        repository.add(delta)
    }

    @PatchMapping(consumes = arrayOf("application/ld+json"))
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun patch(@RequestBody delta: Model) {
        try {
            repository.update(delta)
        } catch (e: IllegalArgumentException) {
            throw NotFoundException("")
        }
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@RequestParam("subject") subject: String?, @RequestParam("predicate") predicate: String?) {
        repository.remove(subject, predicate)
    }
}