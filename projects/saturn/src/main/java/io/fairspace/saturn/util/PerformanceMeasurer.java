package io.fairspace.saturn.util;

import lombok.extern.slf4j.Slf4j;

import static spark.Spark.afterAfter;
import static spark.Spark.before;

@Slf4j
public class PerformanceMeasurer {
    public static void applyPerformanceMeasuring() {
        before((request, response) ->{
            request.attribute("startTime", System.nanoTime());
        });
        afterAfter((request, response) ->{
            Object startTime = request.attribute("startTime");

            if(startTime != null) {
                long elapsedNanos = System.nanoTime() - ((long)startTime);
                log.debug("Duration of {} request to {} (status {}): {} ms", request.requestMethod(), request.pathInfo(), response.status(), elapsedNanos / 1000000);
                request.attribute("startTime", null);
            }
        });

    }
}
