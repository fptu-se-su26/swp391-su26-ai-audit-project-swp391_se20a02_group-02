package com.luxeway.controller;

import com.luxeway.service.FAQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/faqs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FAQController {

    @Autowired
    private FAQService faqService;

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getFAQs() {
        return ResponseEntity.ok(faqService.getActiveFAQs());
    }
}
