package com.luxeway.repository;

import com.luxeway.entity.BookingCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingCounterRepository extends JpaRepository<BookingCounter, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM BookingCounter c WHERE c.name = :name")
    Optional<BookingCounter> findByNameForUpdate(@Param("name") String name);
}
