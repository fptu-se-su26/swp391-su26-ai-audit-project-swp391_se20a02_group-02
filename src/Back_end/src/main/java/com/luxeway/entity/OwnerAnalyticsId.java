package com.luxeway.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnerAnalyticsId implements Serializable {
    private String ownerId;
    private String yearMonth;
}
