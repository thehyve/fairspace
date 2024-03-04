package io.fairspace.saturn.services.health;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Health {
    @NotNull
    private HealthStatus status = HealthStatus.UP;

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Map<String, HealthStatus> components = new HashMap<>();
}
