package com.luxeway.repository;

import com.luxeway.entity.AIUserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIUserPreferenceRepository extends JpaRepository<AIUserPreference, String> {
}
