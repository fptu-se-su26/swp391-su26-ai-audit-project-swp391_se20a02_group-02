package com.luxeway.repository;

import com.luxeway.entity.User;
import com.luxeway.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // Authentication
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailAndIsActiveTrue(String email);
    
    boolean existsByEmail(String email);
    
    // User management
    List<User> findByRole(UserRole role);
    
    List<User> findByRoleAndIsActiveTrue(UserRole role);
    
    Page<User> findByRole(UserRole role, Pageable pageable);
    
    List<User> findByKycStatus(String kycStatus);
    
    // Business owner users
    List<User> findByAccountType(String accountType);
    
    Page<User> findByAccountType(String accountType, Pageable pageable);
    
    // Search users
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:kycStatus IS NULL OR u.kycStatus = :kycStatus) AND " +
           "(:keyword IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "                  LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "                  LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "                  LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchUsersAdvanced(@Param("role") UserRole role, 
                                   @Param("kycStatus") String kycStatus, 
                                   @Param("keyword") String keyword, 
                                   Pageable pageable);
    
    // Statistics
    long countByRole(UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    long countByRoleAndIsActiveTrue(@Param("role") UserRole role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = true AND u.isActive = true")
    long countVerifiedUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.kycVerified = true AND u.isActive = true")
    long countKycVerifiedUsers();
    
    // Top rated users
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.totalReviews > 0 ORDER BY u.rating DESC")
    List<User> findTopRatedUsersByRole(@Param("role") UserRole role, Pageable pageable);
    
    // Location-based
    List<User> findByLocationContainingIgnoreCase(String location);
    
    // Recently joined
    @Query("SELECT u FROM User u WHERE u.isActive = true ORDER BY u.joinedAt DESC")
    List<User> findRecentlyJoinedUsers(Pageable pageable);
}