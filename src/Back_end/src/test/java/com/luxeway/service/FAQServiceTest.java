package com.luxeway.service;

import com.luxeway.entity.FAQ;
import com.luxeway.repository.FAQRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FAQServiceTest {

    @Mock
    private FAQRepository faqRepository;

    @InjectMocks
    private FAQService faqService;

    // =======================================================
    // updateFAQ
    // =======================================================

    @Test
    void updateFAQ_ValidId_UpdatesAndReturns() {
        FAQ existing = FAQ.builder().id(1L).question("Old Q").build();
        FAQ updated = FAQ.builder().question("New Q").answer("New A").isActive(true).displayOrder(1).build();

        when(faqRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(faqRepository.save(any(FAQ.class))).thenAnswer(i -> i.getArgument(0));

        FAQ result = faqService.updateFAQ(1L, updated);

        assertEquals("New Q", result.getQuestion());
        assertEquals("New A", result.getAnswer());
        assertTrue(result.getIsActive());
        assertEquals(1, result.getDisplayOrder());
        verify(faqRepository).save(existing);
    }

    @Test
    void updateFAQ_InvalidId_ThrowsException() {
        when(faqRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> faqService.updateFAQ(999L, new FAQ()));
        verify(faqRepository, never()).save(any(FAQ.class));
    }

    // =======================================================
    // getActiveFAQs
    // =======================================================

    @Test
    void getActiveFAQs_ReturnsMappedList() {
        FAQ faq = FAQ.builder().question("Q1").answer("A1").isActive(true).build();
    
        when(faqRepository.findByIsActiveTrueOrderByDisplayOrderAsc()).thenReturn(List.of(faq));

        List<Map<String, String>> result = faqService.getActiveFAQs();

        assertEquals(1, result.size());
        assertEquals("Q1", result.get(0).get("q"));
        assertEquals("A1", result.get(0).get("a"));
    }

    // =======================================================
    // getAllFAQs
    // =======================================================

    @Test
    void getAllFAQs_ReturnsAll() {
        when(faqRepository.findAll()).thenReturn(List.of(new FAQ(), new FAQ()));
        List<FAQ> result = faqService.getAllFAQs();
        assertEquals(2, result.size());
    }

    // =======================================================
    // createFAQ
    // =======================================================

    @Test
    void createFAQ_SavesAndReturns() {
        FAQ input = FAQ.builder().question("Q").build();
    
        when(faqRepository.save(input)).thenReturn(input);

        FAQ result = faqService.createFAQ(input);

        verify(faqRepository).save(input);
        assertEquals(input, result);
    }

    // =======================================================
    // deleteFAQ
    // =======================================================

    @Test
    void deleteFAQ_DeletesById() {
        faqService.deleteFAQ(1L);
        verify(faqRepository).deleteById(1L);
    }
}
