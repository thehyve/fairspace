package io.fairspace.ceres.pid.web

import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.service.PidService
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/pid")
class PidController(val pidService: PidService) {


    @GetMapping( produces = [ "application/json"], params = ["id"])
    fun get (@RequestParam("id", required = false ) id: UUID) {
        pidService.findById(id)
    }

    @GetMapping( produces = [ "application/json"], params = ["uri"])
    fun get (@RequestParam("id", required = false ) uri: String ) {
        pidService.findByUri(uri)
    }

    @PostMapping( produces = [ "application/json"] )
    fun post (@RequestBody pid : Pid) {
        pidService.add(pid, errorAlreadyExists = true )
    }

    @PatchMapping ( produces = [ "application/json"])
    fun patch ( @RequestBody pid : Pid ) {
        pidService.add(pid, errorAlreadyExists = false )
    }

    @DeleteMapping ( params = ["id"])
    fun delete ( @RequestParam ("id") id: UUID ) {
        pidService.delete(id);
    }

    @DeleteMapping ( params = ["uri"])
    fun delete ( @RequestParam ("uri") uri: String ) {
        pidService.delete(uri);
    }

}
