package com.luxeway.repository;

import com.luxeway.entity.MotorbikeDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MotorbikeDepositRepository extends JpaRepository<MotorbikeDeposit, String> {
    List<MotorbikeDeposit> findByMotorbikeIdAndIsActiveTrue(String motorbikeId);
    List<MotorbikeDeposit> findByMotorbikeId(String motorbikeId);
}
