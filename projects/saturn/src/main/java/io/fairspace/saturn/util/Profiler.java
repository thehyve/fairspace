package io.fairspace.saturn.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.util.function.Supplier;

@UtilityClass
@Slf4j
public class Profiler {

    public static <T> T profileAndExecute(Supplier<T> supplier, String name) {
        var startTime = System.currentTimeMillis();
        var result = supplier.get();
        var elapsed = System.currentTimeMillis() - startTime;
        log.info("Elapsed time for {}: {} ms", name, elapsed);
        return result;
    }

    public static void profileAndExecute(Runnable runnable, String name) {
        var startTime = System.currentTimeMillis();
        runnable.run();
        var elapsed = System.currentTimeMillis() - startTime;
        log.info("Elapsed time for {}: {} ms", name, elapsed);
    }

}
