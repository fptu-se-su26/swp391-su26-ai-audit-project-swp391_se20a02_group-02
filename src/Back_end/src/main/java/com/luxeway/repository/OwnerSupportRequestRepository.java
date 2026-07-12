package com.luxeway.repository;

import com.luxeway.entity.OwnerSupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OwnerSupportRequestRepository extends JpaRepository<OwnerSupportRequest, String> {
    List<OwnerSupportRequest> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    List<OwnerSupportRequest> findByStatus(String status);
}
