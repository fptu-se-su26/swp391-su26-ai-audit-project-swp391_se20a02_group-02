package com.luxeway.service;

import com.luxeway.entity.FAQ;
import com.luxeway.repository.FAQRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
public class FAQService {
    @Autowired
    private FAQRepository faqRepository;

    public List<Map<String, String>> getActiveFAQs() {
        return faqRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(faq -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("q", faq.getQuestion());
                    map.put("a", faq.getAnswer());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
