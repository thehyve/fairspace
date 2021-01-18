package io.fairspace.saturn.services.views;

import lombok.Value;

@Value
public class ValueDTO implements Comparable<ValueDTO> {
    String label;
    Object value;

    @Override
    public int compareTo(ValueDTO o) {
        return label.compareTo(o.label);
    }
}
