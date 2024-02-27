package nl.fairspace.pluto.web.dto;

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
public class DownstreamServiceHealthStatus {
    @NotNull
    private String status;

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Map<String, String> components = new HashMap<>();
}
