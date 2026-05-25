package com.luxeway.repository;

import com.luxeway.entity.DigitalContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DigitalContractRepository extends JpaRepository<DigitalContract, Long> {
    Optional<DigitalContract> findByBookingId(String bookingId);
}
