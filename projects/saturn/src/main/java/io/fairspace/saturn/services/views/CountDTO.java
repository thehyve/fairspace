package io.fairspace.saturn.services.views;

import lombok.Data;

@Data
public class CountDTO {
    private final long count;
    private final boolean timeout;
}
