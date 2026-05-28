package com.luxeway.service;

import com.luxeway.entity.Coupon;
import com.luxeway.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code).orElse(null);
    }

    public boolean validateCoupon(String code) {
        Coupon coupon = getCouponByCode(code);
        return coupon != null && coupon.isValid();
    }

    @Transactional
    public Coupon useCoupon(String code) {
        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(code);
        if (opt.isPresent()) {
            Coupon coupon = opt.get();
            if (coupon.isValid()) {
                coupon.setCurrentUses(coupon.getCurrentUses() + 1);
                return couponRepository.save(coupon);
            }
        }
        return null;
    }

    public BigDecimal calculateDiscount(String code, BigDecimal originalAmount) {
        Coupon coupon = getCouponByCode(code);
        if (coupon == null || !coupon.isValid()) {
            return BigDecimal.ZERO;
        }

        BigDecimal discountPercentage = BigDecimal.valueOf(coupon.getDiscountPercentage()).divide(BigDecimal.valueOf(100));
        BigDecimal discountAmount = originalAmount.multiply(discountPercentage);

        if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discountAmount = coupon.getMaxDiscountAmount();
        }

        return discountAmount;
    }
}
