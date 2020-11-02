package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.Config;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FacetDTO {
    String name;
    String title;
    Config.Search.ValueType type;
    //TODO: values & counts
}
