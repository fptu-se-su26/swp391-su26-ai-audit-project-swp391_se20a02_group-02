package com.luxeway.repository;

import com.luxeway.entity.MotorbikeAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MotorbikeAddonRepository extends JpaRepository<MotorbikeAddon, String> {
    List<MotorbikeAddon> findByMotorbikeIdAndIsActiveTrue(String motorbikeId);
    List<MotorbikeAddon> findByMotorbikeId(String motorbikeId);
}
