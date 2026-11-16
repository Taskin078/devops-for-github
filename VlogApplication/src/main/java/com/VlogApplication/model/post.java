package com.VlogApplication.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titile;
    @Column(length = 5000)
    private String content;
    private String author;

}
