package com.luxeway.repository;

import com.luxeway.entity.MotorbikeModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MotorbikeModelRepository extends JpaRepository<MotorbikeModel, String> {
    List<MotorbikeModel> findByBrandId(String brandId);
    java.util.Optional<MotorbikeModel> findByName(String name);
}
