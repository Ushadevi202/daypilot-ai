package com.daypilot.routine;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
class OccurrenceIntegrationTest {

    private static final String PASSWORD = "StrongPass123";
    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata"); // the default user timezone

    @Autowired
    private MockMvc mockMvc;

    // --- helpers ---

    private Cookie csrfCookie() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/csrf")).andExpect(status().isNoContent()).andReturn();
        Cookie cookie = result.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(cookie);
        return cookie;
    }

    private MockHttpServletRequestBuilder withCsrf(MockHttpServletRequestBuilder b, Cookie csrf) {
        return b.cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue());
    }

    private MockHttpSession newLoggedInUser() throws Exception {
        String email = "user-" + UUID.randomUUID() + "@example.com";
        String body = "{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}";
        Cookie csrf = csrfCookie();
        mockMvc.perform(withCsrf(post("/api/auth/register"), csrf)
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated());
        MvcResult login = mockMvc.perform(withCsrf(post("/api/auth/login"), csrf)
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk()).andReturn();
        return (MockHttpSession) login.getRequest().getSession(false);
    }

    private String routineJson(String title) {
        return "{\"title\":\"" + title + "\",\"startTime\":\"06:30\",\"endTime\":\"07:00\","
                + "\"recurrenceType\":\"DAILY\",\"startDate\":\"" + LocalDate.now(ZONE) + "\"}";
    }

    private long createRoutine(MockHttpSession session, String title) throws Exception {
        Cookie csrf = csrfCookie();
        String json = mockMvc.perform(withCsrf(post("/api/routines"), csrf).session(session)
                        .contentType(MediaType.APPLICATION_JSON).content(routineJson(title)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ids(json).get(0);
    }

    private List<Long> ids(String json) {
        List<Long> result = new ArrayList<>();
        Matcher m = Pattern.compile("\"id\":(\\d+)").matcher(json);
        while (m.find()) {
            result.add(Long.parseLong(m.group(1)));
        }
        return result;
    }

    private String occurrences(MockHttpSession session, int fromOffset, int toOffset) throws Exception {
        LocalDate today = LocalDate.now(ZONE);
        return mockMvc.perform(get("/api/occurrences")
                        .param("from", today.plusDays(fromOffset).toString())
                        .param("to", today.plusDays(toOffset).toString()).session(session))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    }

    private org.springframework.test.web.servlet.ResultActions setStatus(
            MockHttpSession session, long id, String newStatus) throws Exception {
        return mockMvc.perform(withCsrf(put("/api/occurrences/" + id + "/status"), csrfCookie()).session(session)
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"" + newStatus + "\"}"));
    }

    // --- tests ---

    @Test
    void generatingTwiceDoesNotCreateDuplicates() throws Exception {
        MockHttpSession session = newLoggedInUser();
        createRoutine(session, "Workout");

        mockMvc.perform(get("/api/occurrences").session(session))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mockMvc.perform(get("/api/occurrences").session(session))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void completingTodayDoesNotCompleteTomorrow() throws Exception {
        MockHttpSession session = newLoggedInUser();
        createRoutine(session, "Workout");
        List<Long> ids = ids(occurrences(session, 0, 1));

        setStatus(session, ids.get(0), "COMPLETED")
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("COMPLETED"));

        LocalDate today = LocalDate.now(ZONE);
        mockMvc.perform(get("/api/occurrences").param("from", today.toString())
                        .param("to", today.plusDays(1).toString()).session(session))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[1].status").value("PENDING"));
    }

    @Test
    void futureOccurrenceCannotBeCompleted() throws Exception {
        MockHttpSession session = newLoggedInUser();
        createRoutine(session, "Workout");
        List<Long> ids = ids(occurrences(session, 0, 1));

        setStatus(session, ids.get(1), "COMPLETED").andExpect(status().isBadRequest());
    }

    @Test
    void otherUserCannotChangeMyOccurrence() throws Exception {
        MockHttpSession owner = newLoggedInUser();
        MockHttpSession stranger = newLoggedInUser();
        createRoutine(owner, "Workout");
        List<Long> ids = ids(occurrences(owner, 0, 0));

        setStatus(stranger, ids.get(0), "COMPLETED").andExpect(status().isNotFound());
    }

    @Test
    void editingRoutineKeepsHistoryAndUpdatesFutureDays() throws Exception {
        MockHttpSession session = newLoggedInUser();
        long routineId = createRoutine(session, "Old title");
        List<Long> ids = ids(occurrences(session, 0, 1));
        setStatus(session, ids.get(0), "COMPLETED").andExpect(status().isOk());

        mockMvc.perform(withCsrf(put("/api/routines/" + routineId), csrfCookie()).session(session)
                        .contentType(MediaType.APPLICATION_JSON).content(routineJson("New title")))
                .andExpect(status().isOk());

        LocalDate today = LocalDate.now(ZONE);
        mockMvc.perform(get("/api/occurrences").param("from", today.toString())
                        .param("to", today.plusDays(1).toString()).session(session))
                .andExpect(jsonPath("$[0].title").value("Old title"))   // completed day is history
                .andExpect(jsonPath("$[1].title").value("New title"));  // future day follows the template
    }
}