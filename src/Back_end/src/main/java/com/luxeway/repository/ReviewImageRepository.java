package com.luxeway.repository;

import com.luxeway.entity.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewImage, String> {
    List<ReviewImage> findByReviewId(String reviewId);
}
