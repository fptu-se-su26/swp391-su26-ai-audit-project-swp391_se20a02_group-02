package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSetting {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "account_number", nullable = false, length = 100)
    private String accountNumber;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Version
    @Column(nullable = false)
    private Integer version;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_time", nullable = false)
    @Builder.Default
    private LocalDateTime updatedTime = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    private void beforeSave() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        this.updatedTime = LocalDateTime.now();
    }
}
