package io.fairspace.saturn.services.workspaces;

import lombok.*;

@NoArgsConstructor @AllArgsConstructor
@Data
@Builder
public class WorkspaceSummary {
    private int collectionCount;
    private int memberCount;
}
