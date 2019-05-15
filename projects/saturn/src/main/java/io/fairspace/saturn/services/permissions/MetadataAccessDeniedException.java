package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.services.AccessDeniedException;
import lombok.Getter;
import lombok.NonNull;
import org.apache.jena.graph.Node;

@Getter
public class MetadataAccessDeniedException extends AccessDeniedException {
    @NonNull
    Node subject;

    public MetadataAccessDeniedException(String message, @NonNull Node subject) {
        super(message);
        this.subject = subject;
    }

    public MetadataAccessDeniedException(String message, @NonNull Node subject, Throwable cause) {
        super(message, cause);
        this.subject = subject;
    }
}
