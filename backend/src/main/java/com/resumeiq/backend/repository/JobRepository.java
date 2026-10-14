package com.resumeiq.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.resumeiq.backend.model.Job;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j WHERE (j.active IS NULL OR j.active = true) ORDER BY j.id DESC")
    List<Job> findByActiveTrueOrderByIdDesc();

    @Query("SELECT j FROM Job j WHERE (j.active IS NULL OR j.active = true) " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:jobType IS NULL OR LOWER(j.jobType) = LOWER(:jobType)) " +
           "AND (:workMode IS NULL OR LOWER(j.workMode) = LOWER(:workMode)) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "ORDER BY j.id DESC")
    List<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("jobType") String jobType,
            @Param("workMode") String workMode,
            @Param("location") String location
    );
}