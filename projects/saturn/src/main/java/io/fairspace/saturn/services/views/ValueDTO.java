package io.fairspace.saturn.services.views;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.fairspace.saturn.webdav.Access;
import lombok.Value;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Value
public class ValueDTO implements Comparable<ValueDTO> {
    String label;
    Object value;
    @JsonInclude(NON_NULL)
    Access access;

    @Override
    public int compareTo(ValueDTO o) {
        return label.compareTo(o.label);
    }
}
