package io.fairspace.ceres.pid.web

import io.fairspace.ceres.pid.service.PidService
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/pid")
class PidController(val pidService: PidService) {


}
