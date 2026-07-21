package com.luxeway.repository;

import com.luxeway.entity.OwnerApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerApplicationDocumentRepository extends JpaRepository<OwnerApplicationDocument, String> {
    List<OwnerApplicationDocument> findByApplicationId(String applicationId);
}
