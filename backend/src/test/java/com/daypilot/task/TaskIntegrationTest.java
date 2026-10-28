package com.daypilot.task;

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

class TaskIntegrationTest extends IntegrationTestBase {

    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata"); // default timezone of new users

    private ResultActions send(MockHttpSession session, MockHttpServletRequestBuilder builder, String json)
            throws Exception {
        MockHttpServletRequestBuilder request = withCsrf(builder).session(session);
        if (json != null) {
            request = request.contentType(MediaType.APPLICATION_JSON).content(json);
        }
        return mockMvc.perform(request);
    }

    private long createTask(MockHttpSession session, String json) throws Exception {
        String body = send(session, post("/api/tasks"), json)
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return idOf(body);
    }

    @Test
    void quickAddNeedsOnlyATitle() throws Exception {
        MockHttpSession session = newLoggedInUser();
        send(session, post("/api/tasks"), "{\"title\":\"Stitch blouse\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.priority").value("MEDIUM"))
                .andExpect(jsonPath("$.status").value("PENDING"));
        send(session, post("/api/tasks"), "{\"title\":\"\"}").andExpect(status().isBadRequest());
    }

    @Test
    void completeAndReopenAreRecordedInHistory() throws Exception {
        MockHttpSession session = newLoggedInUser();
        long id = createTask(session, "{\"title\":\"Revise Java\"}");

        send(session, put("/api/tasks/" + id + "/complete"), null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("COMPLETED"));
        send(session, put("/api/tasks/" + id + "/reopen"), null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PENDING"));

        send(session, get("/api/tasks/" + id + "/history"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].action").value("REOPENED"))
                .andExpect(jsonPath("$[2].action").value("CREATED"));
    }

    @Test
    void postponeOnlyMovesTheDueDateLater() throws Exception {
        MockHttpSession session = newLoggedInUser();
        LocalDate today = LocalDate.now(ZONE);
        long id = createTask(session, "{\"title\":\"Call recruiter\",\"dueDate\":\"" + today.plusDays(1) + "\"}");

        send(session, put("/api/tasks/" + id + "/postpone"), "{\"dueDate\":\"" + today.plusDays(3) + "\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dueDate").value(today.plusDays(3).toString()))
                .andExpect(jsonPath("$.postponedCount").value(1));

        send(session, put("/api/tasks/" + id + "/postpone"), "{\"dueDate\":\"" + today.plusDays(2) + "\"}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void overdueListShowsOnlyPendingTasksPastTheirDueDate() throws Exception {
        MockHttpSession session = newLoggedInUser();
        LocalDate today = LocalDate.now(ZONE);
        createTask(session, "{\"title\":\"Overdue A\",\"dueDate\":\"" + today.minusDays(1) + "\"}");
        createTask(session, "{\"title\":\"Future B\",\"dueDate\":\"" + today.plusDays(1) + "\"}");
        long done = createTask(session, "{\"title\":\"Done C\",\"dueDate\":\"" + today.minusDays(1) + "\"}");
        send(session, put("/api/tasks/" + done + "/complete"), null).andExpect(status().isOk());

        send(session, get("/api/tasks?overdue=true"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Overdue A"))
                .andExpect(jsonPath("$[0].overdue").value(true));

        send(session, get("/api/tasks?status=COMPLETED"), null)
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Done C"));
    }

    @Test
    void otherUserCannotSeeOrChangeMyTask() throws Exception {
        MockHttpSession owner = newLoggedInUser();
        MockHttpSession stranger = newLoggedInUser();
        long id = createTask(owner, "{\"title\":\"Private task\"}");

        send(stranger, get("/api/tasks/" + id), null).andExpect(status().isNotFound());
        send(stranger, put("/api/tasks/" + id + "/complete"), null).andExpect(status().isNotFound());
        send(stranger, get("/api/tasks"), null).andExpect(jsonPath("$.length()").value(0));
    }
}