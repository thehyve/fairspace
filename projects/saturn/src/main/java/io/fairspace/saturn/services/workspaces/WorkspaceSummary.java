package io.fairspace.saturn.services.workspaces;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor @AllArgsConstructor
@Data
@Builder
public class WorkspaceSummary {
    private int collectionCount;
    private int memberCount;
}
