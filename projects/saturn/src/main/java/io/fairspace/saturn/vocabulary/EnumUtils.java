package io.fairspace.saturn.vocabulary;

import java.util.stream.Stream;

import static java.util.Comparator.naturalOrder;

public class EnumUtils {

    public static <T extends Enum<T>> T max(T... values) {
        return Stream.of(values).max(naturalOrder()).get();
    }

    public static <T extends Enum<T>> T min(T... values) {
        return Stream.of(values).min(naturalOrder()).get();
    }
}
