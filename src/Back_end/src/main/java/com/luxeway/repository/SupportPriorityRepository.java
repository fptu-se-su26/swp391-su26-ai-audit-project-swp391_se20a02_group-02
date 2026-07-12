package com.luxeway.repository;

import com.luxeway.entity.SupportPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupportPriorityRepository extends JpaRepository<SupportPriority, Integer> {
    Optional<SupportPriority> findByName(String name);
}
