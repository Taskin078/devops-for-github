package com.VlogApplication.Repositry;


import com.VlogApplication.model.post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<post, Long> {
    Long id(Long id);
}
