package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.User;
import org.example.lvstore.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("User with id %s not found", id)));
    }
}
