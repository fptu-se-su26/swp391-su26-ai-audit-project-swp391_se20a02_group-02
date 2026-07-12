package com.luxeway.repository;

import com.luxeway.entity.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, String> {

    List<UserDocument> findByUserIdOrderByUploadedAtDesc(String userId);

    List<UserDocument> findByUserIdAndDocumentType(String userId, String documentType);

    List<UserDocument> findByUserIdAndDocumentTypeOrderByUploadedAtDesc(String userId, String documentType);

    boolean existsByUserIdAndDocumentTypeAndStatus(String userId, String documentType, String status);
}
