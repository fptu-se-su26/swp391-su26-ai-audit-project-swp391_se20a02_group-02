package com.luxeway.repository;

import com.luxeway.entity.CarBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarBrandRepository extends JpaRepository<CarBrand, String> {
    List<CarBrand> findByIsActiveTrue();
}
