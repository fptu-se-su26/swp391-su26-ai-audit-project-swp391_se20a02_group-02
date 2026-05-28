package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.Coupon;
import com.luxeway.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/validate/{code}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(@PathVariable String code) {
        boolean isValid = couponService.validateCoupon(code);
        if (!isValid) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired coupon code"));
        }
        
        Coupon coupon = couponService.getCouponByCode(code);
        Map<String, Object> data = new HashMap<>();
        data.put("code", coupon.getCode());
        data.put("discountPercentage", coupon.getDiscountPercentage());
        data.put("maxDiscountAmount", coupon.getMaxDiscountAmount());
        
        return ResponseEntity.ok(ApiResponse.success("Coupon is valid", data));
    }
    
    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateDiscount(
            @RequestParam String code, 
            @RequestParam BigDecimal amount) {
        BigDecimal discount = couponService.calculateDiscount(code, amount);
        return ResponseEntity.ok(ApiResponse.success("Discount calculated", discount));
    }
}
