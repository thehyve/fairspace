package io.fairspace.saturn.services.health;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Health {
    @NotNull
    private HealthStatus status = HealthStatus.UP;

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Map<String, HealthStatus> components = new HashMap<>();
}
