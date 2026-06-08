package com.luxeway.repository;

import com.luxeway.entity.MotorbikeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MotorbikeReviewRepository extends JpaRepository<MotorbikeReview, String> {
    List<MotorbikeReview> findByMotorbikeId(String motorbikeId);
}
