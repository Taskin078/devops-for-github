package com.VlogApplication.service;

import com.VlogApplication.Repositry.PostRepository;
import com.VlogApplication.model.post;
import jakarta.persistence.PostRemove;
import org.apache.catalina.LifecycleState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository repo;

    public List<post> getAll(){
        return repo.findAll();

    }
    public post getOne(Long id){
        return repo.findById(id).orElseThrow();

    }
    public post create (post post){
        return repo.save(post);
    }
    public void delete (Long id) {
        repo.deleteById(id);
    }

    public post update (Long id, post post) {
        post pre=repo.findById(id).orElseThrow();

        pre.setTitile(post.getTitile());
        pre.setContent(post.getContent());
        pre.setAuthor(post.getAuthor());

        return repo.save(pre);
    }

}
