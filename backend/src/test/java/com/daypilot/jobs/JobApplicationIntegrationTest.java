package com.daypilot.jobs;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.daypilot.IntegrationTestBase;

class JobApplicationIntegrationTest extends IntegrationTestBase {

    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata"); // default timezone of new users
    private static final String MINIMAL = "{\"company\":\"Example Technologies\",\"jobTitle\":\"Java Developer\"}";

    private ResultActions call(MockHttpSession session, MockHttpServletRequestBuilder builder, String json)
            throws Exception {
        MockHttpServletRequestBuilder request = withCsrf(builder).session(session);
        if (json != null) {
            request = request.contentType(MediaType.APPLICATION_JSON).content(json);
        }
        return mockMvc.perform(request);
    }

    private long createApp(MockHttpSession session, String json) throws Exception {
        String body = call(session, post("/api/applications"), json)
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return idOf(body);
    }

    @Test
    void newApplicationDefaultsToAppliedAndStartsItsHistory() throws Exception {
        MockHttpSession session = newLoggedInUser();
        long id = createApp(session, MINIMAL);

        call(session, get("/api/applications/" + id), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.appliedDate").value(LocalDate.now(ZONE).toString()));

        call(session, get("/api/applications/" + id + "/events"), null)
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].type").value("STATUS_CHANGE"));
    }

    @Test
    void statusAndEventsAreSeparate() throws Exception {
        MockHttpSession session = newLoggedInUser();
        long id = createApp(session, MINIMAL);

        call(session, put("/api/applications/" + id + "/status"), "{\"status\":\"INTERVIEW\"}")
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("INTERVIEW"));

        call(session, post("/api/applications/" + id + "/events"), "{\"type\":\"OFFER\",\"details\":\"Verbal offer\"}")
                .andExpect(status().isCreated());

        // adding an OFFER event must not change the status by itself
        call(session, get("/api/applications/" + id), null)
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        call(session, get("/api/applications/" + id + "/events"), null)
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void scheduledEventsNeedADateAndStatusChangesCannotBeAddedByHand() throws Exception {
        MockHttpSession session = newLoggedInUser();
        long id = createApp(session, MINIMAL);

        call(session, post("/api/applications/" + id + "/events"), "{\"type\":\"INTERVIEW_ROUND_1\"}")
                .andExpect(status().isBadRequest());
        call(session, post("/api/applications/" + id + "/events"), "{\"type\":\"STATUS_CHANGE\"}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void upcomingShowsOnlyFutureScheduledEvents() throws Exception {
        MockHttpSession session = newLoggedInUser();
        long id = createApp(session, MINIMAL);
        LocalDate today = LocalDate.now(ZONE);

        call(session, post("/api/applications/" + id + "/events"),
                "{\"type\":\"INTERVIEW_ROUND_1\",\"eventDate\":\"" + today.plusDays(2) + "\",\"eventTime\":\"11:00\"}")
                .andExpect(status().isCreated());
        call(session, post("/api/applications/" + id + "/events"),
                "{\"type\":\"INTERVIEW_ROUND_2\",\"eventDate\":\"" + today.minusDays(3) + "\"}")
                .andExpect(status().isCreated());

        call(session, get("/api/applications/upcoming?days=14"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].company").value("Example Technologies"))
                .andExpect(jsonPath("$[0].type").value("INTERVIEW_ROUND_1"));
    }

    @Test
    void followUpFilterShowsOnlyDueActiveApplications() throws Exception {
        MockHttpSession session = newLoggedInUser();
        LocalDate today = LocalDate.now(ZONE);
        createApp(session, "{\"company\":\"Due Corp\",\"jobTitle\":\"Dev\",\"followUpDate\":\""
                + today.minusDays(1) + "\"}");
        createApp(session, "{\"company\":\"Later Corp\",\"jobTitle\":\"Dev\",\"followUpDate\":\""
                + today.plusDays(1) + "\"}");
        createApp(session, "{\"company\":\"Closed Corp\",\"jobTitle\":\"Dev\",\"status\":\"REJECTED\","
                + "\"followUpDate\":\"" + today.minusDays(1) + "\"}");

        call(session, get("/api/applications?followUpDue=true"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].company").value("Due Corp"))
                .andExpect(jsonPath("$[0].followUpDue").value(true));
    }

    @Test
    void otherUserCannotSeeOrChangeMyApplication() throws Exception {
        MockHttpSession owner = newLoggedInUser();
        MockHttpSession stranger = newLoggedInUser();
        long id = createApp(owner, MINIMAL);

        call(stranger, get("/api/applications/" + id), null).andExpect(status().isNotFound());
        call(stranger, put("/api/applications/" + id + "/status"), "{\"status\":\"REJECTED\"}")
                .andExpect(status().isNotFound());
        call(stranger, get("/api/applications/" + id + "/events"), null).andExpect(status().isNotFound());
        call(stranger, get("/api/applications"), null).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void unsafeJobLinksAreRejected() throws Exception {
        MockHttpSession session = newLoggedInUser();
        call(session, post("/api/applications"),
                "{\"company\":\"X\",\"jobTitle\":\"Y\",\"jobUrl\":\"javascript:alert(1)\"}")
                .andExpect(status().isBadRequest());
    }
}