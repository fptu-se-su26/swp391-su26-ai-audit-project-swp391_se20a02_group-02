package com.luxeway.repository;

import com.luxeway.entity.CarReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarReviewRepository extends JpaRepository<CarReview, String> {
    List<CarReview> findByCarId(String carId);
}
