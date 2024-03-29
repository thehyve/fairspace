package nl.fairspace.pluto.web;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Serves index page instead of error page when a static resource is not found.
 */
@Controller
public class DefaultPageController implements ErrorController {
    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, HttpServletResponse response) {
        var status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (status != null) {
            var statusCode = HttpStatus.valueOf(Integer.parseInt(status.toString()));

            if (statusCode == HttpStatus.NOT_FOUND) {
                response.setStatus(HttpServletResponse.SC_OK);
                return "/";
            } else if (statusCode.is4xxClientError()) {
                return "/error/4xx.html";
            } else if (statusCode.is5xxServerError()) {
                return "/error/5xx.html";
            }
        }
        return "error";
    }

    public String getErrorPath() {
        return null;
    }
}
