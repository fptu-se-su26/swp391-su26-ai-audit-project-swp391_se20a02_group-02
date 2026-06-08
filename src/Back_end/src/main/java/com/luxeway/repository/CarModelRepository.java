package com.luxeway.repository;

import com.luxeway.entity.CarModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarModelRepository extends JpaRepository<CarModel, String> {
    List<CarModel> findByBrandId(String brandId);
    java.util.Optional<CarModel> findByName(String name);
}
