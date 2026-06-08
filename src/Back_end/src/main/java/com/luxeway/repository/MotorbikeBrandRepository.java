package com.luxeway.repository;

import com.luxeway.entity.MotorbikeBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MotorbikeBrandRepository extends JpaRepository<MotorbikeBrand, String> {
    List<MotorbikeBrand> findByIsActiveTrue();
    java.util.Optional<MotorbikeBrand> findByName(String name);
}
