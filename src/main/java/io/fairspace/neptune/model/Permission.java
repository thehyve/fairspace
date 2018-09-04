package io.fairspace.neptune.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonIgnore
    private Long id;

    @NotNull
    String subject;

    @ManyToOne(targetEntity = Collection.class, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    Long collection;

    @NotNull
    @Enumerated(EnumType.STRING)
    Access access;
}
