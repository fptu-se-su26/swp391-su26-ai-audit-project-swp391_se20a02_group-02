package com.luxeway.repository;

import com.luxeway.entity.SupportAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportAgentRepository extends JpaRepository<SupportAgent, String> {
    List<SupportAgent> findByStatus(String status);
    List<SupportAgent> findByDepartmentAndStatus(String department, String status);
}
