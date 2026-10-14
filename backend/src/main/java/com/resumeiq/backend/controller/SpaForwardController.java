package com.resumeiq.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards client-side React Router paths to index.html so refreshing
 * or directly navigating to SPA routes works seamlessly.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/login",
        "/register",
        "/dashboard",
        "/resume-upload",
        "/resume-analysis",
        "/skills",
        "/jobs",
        "/job-details",
        "/job-details/**",
        "/job-matching",
        "/skill-gap",
        "/recommendations",
        "/applications",
        "/saved-jobs",
        "/ai-assistant",
        "/roadmap",
        "/interview-coach",
        "/career-comparison",
        "/job-alerts",
        "/profile",
        "/admin-dashboard",
        "/admin/users",
        "/admin/jobs",
        "/admin/roles"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
