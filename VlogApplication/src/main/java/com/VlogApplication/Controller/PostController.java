package com.VlogApplication.Controller;

import com.VlogApplication.model.post;
import com.VlogApplication.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    // Get all posts
    @GetMapping
    public List<post> getAll() {
        return postService.getAll();
    }

    // Get single post
    @GetMapping("/{id}")
    public post getOne(@PathVariable Long id) {
        return postService.getOne(id);
    }

    // Create new post
    @PostMapping
    public post create(@RequestBody post post) {
        return postService.create(post);
    }

    // Delete post
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }

    // Update post
    @PutMapping("/{id}")
    public post update(@PathVariable Long id, @RequestBody post post) {
        return postService.update(id, post);
    }
}