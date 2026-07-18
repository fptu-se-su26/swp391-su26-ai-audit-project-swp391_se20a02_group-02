package com.luxeway.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeway.entity.HelpArticle;
import com.luxeway.entity.HelpCategory;
import com.luxeway.repository.HelpArticleRepository;
import com.luxeway.repository.HelpCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({"h2", "dev"})
@Transactional
@SuppressWarnings("all")
public class HelpControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HelpCategoryRepository categoryRepository;

    @Autowired
    private HelpArticleRepository articleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private HelpCategory activeCategory1;
    private HelpCategory activeCategory2;
    private HelpCategory inactiveCategory;
    private HelpCategory unicodeCategory;
    private HelpArticle publishedArticle1;
    private HelpArticle publishedArticle2;
    private HelpArticle draftArticle;

    @BeforeEach
    public void setUp() {
        // Clear repositories to ensure a clean test state
        articleRepository.deleteAll();
        categoryRepository.deleteAll();

        // 1. Create categories
        activeCategory1 = HelpCategory.builder()
                .slug("huong-dan-thue-xe")
                .title("Hướng dẫn thuê xe")
                .description("Các bước hướng dẫn cơ bản")
                .icon("BookOpen")
                .displayOrder(1)
                .isActive(true)
                .articleCount(0)
                .build();

        activeCategory2 = HelpCategory.builder()
                .slug("thanh-toan")
                .title("Phương thức thanh toán")
                .description("Hỗ trợ thanh toán VNPay, MoMo...")
                .icon("CreditCard")
                .displayOrder(2)
                .isActive(true)
                .articleCount(0)
                .build();

        inactiveCategory = HelpCategory.builder()
                .slug("khuyen-mai-bi-an")
                .title("Khuyến mãi hết hạn")
                .description("Đã bị ẩn")
                .icon("Gift")
                .displayOrder(3)
                .isActive(false)
                .articleCount(0)
                .build();

        unicodeCategory = HelpCategory.builder()
                .slug("hướng-dẫn")
                .title("Unicode Title")
                .description("Unicode slug category")
                .icon("Help")
                .displayOrder(4)
                .isActive(true)
                .articleCount(0)
                .build();

        activeCategory1 = categoryRepository.save(activeCategory1);
        activeCategory2 = categoryRepository.save(activeCategory2);
        inactiveCategory = categoryRepository.save(inactiveCategory);
        unicodeCategory = categoryRepository.save(unicodeCategory);

        // 2. Create articles
        publishedArticle1 = HelpArticle.builder()
                .category(activeCategory1)
                .title("Cách đặt xe nhanh")
                .content("Đây là nội dung bài viết thứ nhất có từ khóa LuxeWay để tìm kiếm.")
                .tags("dat xe, online")
                .viewCount(10)
                .isPublished(true)
                .displayOrder(1)
                .build();

        publishedArticle2 = HelpArticle.builder()
                .category(activeCategory1)
                .title("LuxeWay Hướng dẫn quy trình nhận xe")
                .content("Nội dung bài viết số 2...")
                .tags("quy trinh, LuxeWay")
                .viewCount(5)
                .isPublished(true)
                .displayOrder(2)
                .build();

        draftArticle = HelpArticle.builder()
                .category(activeCategory1)
                .title("Bản nháp hướng dẫn LuxeWay bí mật")
                .content("Nội dung nháp...")
                .tags("huongdan, LuxeWay")
                .viewCount(0)
                .isPublished(false)
                .displayOrder(3)
                .build();

        publishedArticle1 = articleRepository.save(publishedArticle1);
        publishedArticle2 = articleRepository.save(publishedArticle2);
        draftArticle = articleRepository.save(draftArticle);
    }

    @Test
    public void testGetCategories_Success_TC_HEL_001_and_009_and_013() throws Exception {
        mockMvc.perform(get("/api/v1/help/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Categories fetched")))
                .andExpect(jsonPath("$.data", hasSize(3)))
                // Verify display order sorting (displayOrder 1, 2, then 4)
                .andExpect(jsonPath("$.data[0].slug", is("huong-dan-thue-xe")))
                .andExpect(jsonPath("$.data[1].slug", is("thanh-toan")))
                .andExpect(jsonPath("$.data[2].slug", is("hướng-dẫn")))
                // Verify schema schema fields of categories (TC-HEL-009)
                .andExpect(jsonPath("$.data[0].id", notNullValue()))
                .andExpect(jsonPath("$.data[0].slug", notNullValue()))
                .andExpect(jsonPath("$.data[0].title", notNullValue()))
                .andExpect(jsonPath("$.data[0].description", notNullValue()))
                .andExpect(jsonPath("$.data[0].icon", notNullValue()))
                .andExpect(jsonPath("$.data[0].displayOrder", notNullValue()))
                .andExpect(jsonPath("$.data[0].articleCount", notNullValue()));
    }

    @Test
    public void testGetArticlesByCategory_Success_TC_HEL_002_and_023() throws Exception {
        mockMvc.perform(get("/api/v1/help/categories/huong-dan-thue-xe/articles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Articles fetched")))
                // Verify only published articles are returned (size = 2, draftArticle is excluded)
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id", is(publishedArticle1.getId().intValue())))
                .andExpect(jsonPath("$.data[0].title", is("Cách đặt xe nhanh")))
                .andExpect(jsonPath("$.data[0].categorySlug", is("huong-dan-thue-xe")))
                .andExpect(jsonPath("$.data[0].categoryTitle", is("Hướng dẫn thuê xe")))
                .andExpect(jsonPath("$.data[0].excerpt", is("Đây là nội dung bài viết thứ nhất có từ khóa LuxeWay để tìm kiếm.")))
                .andExpect(jsonPath("$.data[0].viewCount", is(10)))
                .andExpect(jsonPath("$.data[0].displayOrder", is(1)));

        // Verify articleCount in category response matches count of published articles (TC-HEL-023)
        mockMvc.perform(get("/api/v1/help/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].articleCount", is(2)));
    }

    @Test
    public void testGetArticleDetail_Success_TC_HEL_003_and_010_and_011() throws Exception {
        // Read article details for the first time
        mockMvc.perform(get("/api/v1/help/articles/" + publishedArticle1.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Article fetched")))
                .andExpect(jsonPath("$.data.id", is(publishedArticle1.getId().intValue())))
                .andExpect(jsonPath("$.data.content", containsString("nội dung bài viết thứ nhất")))
                .andExpect(jsonPath("$.data.viewCount", is(11))) // 10 + 1
                .andExpect(jsonPath("$.data.categorySlug", is("huong-dan-thue-xe")))
                // Schema checking (TC-HEL-010)
                .andExpect(jsonPath("$.data.title", notNullValue()))
                .andExpect(jsonPath("$.data.tags", notNullValue()))
                .andExpect(jsonPath("$.data.displayOrder", notNullValue()))
                .andExpect(jsonPath("$.data.excerpt", notNullValue()))
                .andExpect(jsonPath("$.data.createdAt", notNullValue()))
                .andExpect(jsonPath("$.data.updatedAt", notNullValue()));

        // Consecutive read should increment view count again (TC-HEL-011)
        mockMvc.perform(get("/api/v1/help/articles/" + publishedArticle1.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.viewCount", is(12)));
    }

    @Test
    public void testSearchArticles_Success_TC_HEL_004_and_020() throws Exception {
        mockMvc.perform(get("/api/v1/help/search?q=LuxeWay")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Search results")))
                // Should return 2 published articles matching "LuxeWay" keyword, excluding draft (TC-HEL-012)
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].title", containsString("đặt xe")))
                .andExpect(jsonPath("$.data[1].title", containsString("LuxeWay")));
    }

    @Test
    public void testSearchArticles_EmptyKeyword_TC_HEL_005() throws Exception {
        mockMvc.perform(get("/api/v1/help/search?q=")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Search results")))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    public void testGetArticlesByCategory_NotFound_TC_HEL_006() throws Exception {
        mockMvc.perform(get("/api/v1/help/categories/slug-khong-ton-tai/articles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Category not found: slug-khong-ton-tai")));
    }

    @Test
    public void testGetArticleDetail_NotFound_TC_HEL_007() throws Exception {
        mockMvc.perform(get("/api/v1/help/articles/999999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Article not found: 999999")));
    }

    @Test
    public void testGetCategories_EmptyActive_TC_HEL_008_and_029() throws Exception {
        // Disable all categories
        List<HelpCategory> cats = categoryRepository.findAll();
        for (HelpCategory c : cats) {
            c.setIsActive(false);
            categoryRepository.save(c);
        }

        mockMvc.perform(get("/api/v1/help/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    public void testGetCategories_InvalidJWT_TC_HEL_014() throws Exception {
        mockMvc.perform(get("/api/v1/help/categories")
                        .header("Authorization", "Bearer invalid-jwt-token-string")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    public void testGetArticleDetail_NegativeID_TC_HEL_015() throws Exception {
        mockMvc.perform(get("/api/v1/help/articles/-1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Article not found: -1")));
    }

    @Test
    public void testGetArticleDetail_ZeroID_TC_HEL_016() throws Exception {
        mockMvc.perform(get("/api/v1/help/articles/0")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Article not found: 0")));
    }

    @Test
    public void testGetArticleDetail_LargeID_TC_HEL_017() throws Exception {
        mockMvc.perform(get("/api/v1/help/articles/9223372036854775807")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Article not found: 9223372036854775807")));
    }

    @Test
    public void testSearchArticles_SqlInjection_TC_HEL_021() throws Exception {
        mockMvc.perform(get("/api/v1/help/search?q=' OR 1=1 --")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0))); // No crash, handles as parameter, empty results
    }

    @Test
    public void testGetArticlesByCategory_UnicodeSlug_TC_HEL_022() throws Exception {
        mockMvc.perform(get("/api/v1/help/categories/hướng-dẫn/articles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0))); // Category exists but has no articles
    }

    @Test
    public void testGetArticleDetail_DraftArticle_TC_HEL_025() throws Exception {
        mockMvc.perform(get("/api/v1/help/articles/" + draftArticle.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Article not published")));
    }

    @Test
    public void testGetArticlesByCategory_LongSlug_TC_HEL_026() throws Exception {
        String longSlug = "a".repeat(200);
        mockMvc.perform(get("/api/v1/help/categories/" + longSlug + "/articles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Category not found: " + longSlug)));
    }

    @Test
    public void testPostCategory_NotAllowed_TC_HEL_027() throws Exception {
        mockMvc.perform(post("/api/v1/help/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slug\":\"test-post\",\"title\":\"Test Post\"}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    public void testPostArticle_NotAllowed_TC_HEL_028() throws Exception {
        mockMvc.perform(post("/api/v1/help/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Test Post\",\"content\":\"Nội dung\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testSearchArticles_LongQuery_TC_HEL_030() throws Exception {
        String longQuery = "a".repeat(500);
        mockMvc.perform(get("/api/v1/help/search?q=" + longQuery)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }
}
