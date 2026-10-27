package com.daypilot;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthSecurityIntegrationTest {

    private static final String PASSWORD = "StrongPass123";

    @Autowired
    private MockMvc mockMvc;

    // --- helpers ---

    private Cookie csrfCookie() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isNoContent())
                .andReturn();
        Cookie cookie = result.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(cookie, "XSRF-TOKEN cookie should be set");
        return cookie;
    }

    private MockHttpServletRequestBuilder withCsrf(MockHttpServletRequestBuilder builder, Cookie csrf) {
        return builder.cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue());
    }

    private String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    private void register(String email) throws Exception {
        Cookie csrf = csrfCookie();
        mockMvc.perform(withCsrf(post("/api/auth/register"), csrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isCreated());
    }

    private MockHttpSession login(String email) throws Exception {
        Cookie csrf = csrfCookie();
        MvcResult result = mockMvc.perform(withCsrf(post("/api/auth/login"), csrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    // --- tests ---

    @Test
    void anonymousUserCannotReadProfile() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousUserCannotChangeSettings() throws Exception {
        Cookie csrf = csrfCookie();
        mockMvc.perform(withCsrf(put("/api/settings"), csrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"timezone\":\"Europe/London\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void postWithoutCsrfTokenIsForbidden() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + uniqueEmail() + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void loggedInUserNeverReceivesPasswordData() throws Exception {
        String email = uniqueEmail();
        register(email);
        MockHttpSession session = login(email);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void wrongPasswordAndUnknownEmailGiveTheSameError() throws Exception {
        String email = uniqueEmail();
        register(email);

        Cookie csrf1 = csrfCookie();
        mockMvc.perform(withCsrf(post("/api/auth/login"), csrf1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"WrongPassword1\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));

        Cookie csrf2 = csrfCookie();
        mockMvc.perform(withCsrf(post("/api/auth/login"), csrf2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + uniqueEmail() + "\",\"password\":\"WrongPassword1\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));
    }

    @Test
    void changingOneUsersTimezoneDoesNotAffectAnotherUser() throws Exception {
        String emailA = uniqueEmail();
        String emailB = uniqueEmail();
        register(emailA);
        register(emailB);
        MockHttpSession sessionA = login(emailA);
        MockHttpSession sessionB = login(emailB);

        Cookie csrf = csrfCookie();
        mockMvc.perform(withCsrf(put("/api/settings"), csrf).session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"timezone\":\"Europe/London\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timezone").value("Europe/London"));

        mockMvc.perform(get("/api/auth/me").session(sessionB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timezone").value("Asia/Kolkata"));
    }

    @Test
    void invalidTimezoneIsRejected() throws Exception {
        String email = uniqueEmail();
        register(email);
        MockHttpSession session = login(email);

        Cookie csrf = csrfCookie();
        mockMvc.perform(withCsrf(put("/api/settings"), csrf).session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"timezone\":\"Mars/Base\"}"))
                .andExpect(status().isBadRequest());
    }
}