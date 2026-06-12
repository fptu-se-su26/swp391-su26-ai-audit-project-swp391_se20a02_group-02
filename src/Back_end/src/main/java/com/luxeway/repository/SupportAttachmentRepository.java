package com.luxeway.repository;

import com.luxeway.entity.SupportAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportAttachmentRepository extends JpaRepository<SupportAttachment, String> {
}
