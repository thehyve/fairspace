package io.fairspace.neptune.web;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

public class Caching {
    private int cachePeriod;

    public Caching(int cachePeriod) {
        this.cachePeriod = cachePeriod;
    }

    public <T> ResponseEntity<T> withCacheControl(T body) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(cachePeriod, TimeUnit.SECONDS))
                .body(body);
    }
}
