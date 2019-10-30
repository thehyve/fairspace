package io.fairspace.saturn.util;

import lombok.extern.slf4j.Slf4j;

import static java.lang.System.currentTimeMillis;
import static spark.Spark.afterAfter;
import static spark.Spark.before;

@Slf4j
public class PerformanceMeasurer {
    public static void applyPerformanceMeasuring() {
        before((request, response) -> request.attribute("startTime", currentTimeMillis()));

        afterAfter((request, response) ->{
            Long startTime = request.attribute("startTime");

            if(startTime != null) {
                long elapsedMillis = currentTimeMillis() - startTime;
                log.debug("Duration of {} request to {} (status {}): {} ms", request.requestMethod(), request.pathInfo(), response.status(), elapsedMillis);
                request.attribute("startTime", null);
            }
        });

    }
}
