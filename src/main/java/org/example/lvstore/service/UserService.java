package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.User;
import org.example.lvstore.payload.user.CreateUserRequest;
import org.example.lvstore.payload.user.UpdateUserRequest;
import org.example.lvstore.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("User with id %s not found", id)));
    }

    public User createUser(CreateUserRequest createUserRequest) {
        if (userRepository.existsByUsername(createUserRequest.username())) {
            throw new IllegalArgumentException(String.format("Username %s already exists", createUserRequest.username()));
        }
        if (userRepository.existsByEmail(createUserRequest.email())) {
            throw new IllegalArgumentException(String.format("Email %s already exists", createUserRequest.email()));
        }

        User user = User.builder()
                .username(createUserRequest.username())
                .password(createUserRequest.password())
                .email(createUserRequest.email())
                .role(createUserRequest.role())
                .build();
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException(String.format("User with username '%s' not found", username)));
    }

    public User updateUser(UpdateUserRequest updateUserRequest) {
        User user = getUserById(updateUserRequest.id());

        user.setUsername(updateUserRequest.username());
        user.setPassword(updateUserRequest.password());
        user.setEmail(updateUserRequest.email());
        user.setRole(updateUserRequest.role());

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

}
