package io.fairspace.saturn.util;

import java.util.Objects;

public final class Ref<T> {
    public T value;

    public Ref() {
    }

    public Ref(T value) {
        this.value = value;
    }

    public static <T> Ref<T> ref(T value) {
        return new Ref<>(value);
    }

    public static <T> Ref<T> ref() {
        return new Ref<>();
    }

    @Override
    public String toString() {
        return "Ref(" + value + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Ref<?> ref = (Ref<?>) o;

        return Objects.equals(value, ref.value);
    }

    @Override
    public int hashCode() {
        return value != null ? value.hashCode() : 0;
    }
}
