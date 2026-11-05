package com.itsm.backend;

import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.repository.CategoryRepository;
import com.itsm.backend.service.intelligence.CategorySuggestionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Intelligent Features - Category Suggestion Tests")
class CategorySuggestionTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategorySuggestionService categorySuggestionService;

    @Test
    @DisplayName("Test 5: Suggest Network Category based on VPN/Wifi keywords")
    void testNetworkCategorySuggestion() {
        Category networkCat = Category.builder()
                .id(1L)
                .name("Network")
                .keywords("network,internet,wifi,vpn,connectivity,router")
                .active(true)
                .build();

        Category hardwareCat = Category.builder()
                .id(2L)
                .name("Hardware")
                .keywords("laptop,printer,screen,keyboard,mouse")
                .active(true)
                .build();

        when(categoryRepository.findByActiveTrue()).thenReturn(List.of(networkCat, hardwareCat));

        Optional<Category> suggestion = categorySuggestionService.suggestCategory(
                "VPN Disconnected",
                "I cannot connect to the office VPN while on home wifi"
        );

        assertTrue(suggestion.isPresent());
        assertEquals("Network", suggestion.get().getName());
    }

    @Test
    @DisplayName("Test 6: No Category Suggestion when keywords do not match")
    void testNoMatchSuggestion() {
        Category networkCat = Category.builder()
                .id(1L)
                .name("Network")
                .keywords("network,wifi,vpn")
                .active(true)
                .build();

        when(categoryRepository.findByActiveTrue()).thenReturn(List.of(networkCat));

        Optional<Category> suggestion = categorySuggestionService.suggestCategory(
                "Cafeteria Lunch",
                "What is on the cafeteria menu today?"
        );

        assertTrue(suggestion.isEmpty());
    }
}
