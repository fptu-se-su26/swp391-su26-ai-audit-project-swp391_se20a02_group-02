package com.luxeway.repository;

import com.luxeway.entity.InsurancePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsurancePackageRepository extends JpaRepository<InsurancePackage, String> {
    List<InsurancePackage> findByIsActiveTrue();
}
