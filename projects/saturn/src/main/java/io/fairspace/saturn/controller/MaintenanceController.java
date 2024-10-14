package io.fairspace.saturn.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.fairspace.saturn.config.Services;

@RestController
@RequestMapping("${application.basePath}/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final Services services;

    @PostMapping("/reindex")
    public ResponseEntity<Void> startReindex() {
        services.getMaintenanceService().startRecreateIndexTask();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/compact")
    public ResponseEntity<Void> compactRdfStorage() {
        services.getMaintenanceService().compactRdfStorageTask();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        var status = services.getMaintenanceService().active() ? "active" : "inactive";
        return ResponseEntity.ok(status);
    }
}
