package com.luxeway.service;

import com.luxeway.entity.FAQ;
import com.luxeway.repository.FAQRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public List<FAQ> getAllFAQs() {
        return faqRepository.findAll();
    }

    @Transactional
    public FAQ createFAQ(FAQ faq) {
        return faqRepository.save(faq);
    }

    @Transactional
    public FAQ updateFAQ(Long id, FAQ updated) {
        FAQ existing = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ not found: " + id));
        existing.setQuestion(updated.getQuestion());
        existing.setAnswer(updated.getAnswer());
        existing.setIsActive(updated.getIsActive());
        existing.setDisplayOrder(updated.getDisplayOrder());
        return faqRepository.save(existing);
    }

    @Transactional
    public void deleteFAQ(Long id) {
        faqRepository.deleteById(id);
    }
}
