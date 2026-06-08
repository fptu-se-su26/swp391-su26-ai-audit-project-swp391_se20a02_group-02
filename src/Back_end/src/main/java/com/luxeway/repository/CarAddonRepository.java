package com.luxeway.repository;

import com.luxeway.entity.CarAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarAddonRepository extends JpaRepository<CarAddon, String> {
    List<CarAddon> findByCarIdAndIsActiveTrue(String carId);
    List<CarAddon> findByCarId(String carId);
}
