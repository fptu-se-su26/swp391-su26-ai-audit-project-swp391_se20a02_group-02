package com.luxeway.repository;

import com.luxeway.entity.CarInsurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarInsuranceRepository extends JpaRepository<CarInsurance, String> {
    List<CarInsurance> findByCarIdAndIsActiveTrue(String carId);
    List<CarInsurance> findByCarId(String carId);
}
