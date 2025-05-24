package org.example.lvstore.service;

import org.example.lvstore.entity.User;
import org.example.lvstore.payload.user.CreateUserRequest;
import org.example.lvstore.payload.user.UpdateUserRequest;
import org.example.lvstore.repository.UserRepository;
import org.example.lvstore.service.enums.Role;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.verify;


@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private UserService userService;

    @Test
    void testCreateUser_Success() {
        CreateUserRequest request = new CreateUserRequest("lera", "lera123", "lera@example.com", "Store Administrator");

        when(userRepository.existsByUsername("lera")).thenReturn(false);
        when(userRepository.existsByEmail("lera@example.com")).thenReturn(false);

        User savedUser = User.builder()
                .username("lera1")
                .password("lera123")
                .email("lera@example.com")
                .role(Role.valueOf("Store Administrator"))
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("lera1", result.getUsername());
        assertEquals("lera123", result.getPassword());
        assertEquals("lera@example.com", result.getEmail());
        assertEquals(Role.STORE_ADMINISTRATOR, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }


    @Test
    void testCreateUser_UsernameExists() {
        CreateUserRequest request = new CreateUserRequest("existing", "pass", "new@example.com", "Store Administrator");
        when(userRepository.existsByUsername("existing")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(request));
        verify(userRepository, times(1)).existsByUsername("existing");
        verify(userRepository, times(0)).save(any(User.class));
    }

    @Test
    void testCreateUser_EmailExists() {
        CreateUserRequest request = new CreateUserRequest("unique", "pass", "existing@example.com", "Store Administrator");
        when(userRepository.existsByUsername("unique")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(request));
        verify(userRepository, times(1)).existsByEmail("existing@example.com");
        verify(userRepository, times(0)).save(any(User.class));
    }

    @Test
    void testGetUserById_Success() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.getUserById(1L);
        assertEquals(1L, result.getId());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testGetUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.getUserById(999L));
        verify(userRepository, times(1)).findById(999L);
    }

    @Test
    void testGetUserByUsername_Success() {
        User user = new User();
        user.setUsername("bob");
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(user));

        User result = userService.getUserByUsername("bob");
        assertEquals("bob", result.getUsername());
        verify(userRepository, times(1)).findByUsername("bob");
    }

    @Test
    void testGetUserByUsername_NotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.getUserByUsername("ghost"));
        verify(userRepository, times(1)).findByUsername("ghost");
    }

    @Test
    void testGetAllUsers_Success() {
        User u1 = new User();
        User u2 = new User();
        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<User> users = userService.getAllUsers();
        assertEquals(2, users.size());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testUpdateUser_Success() {
        UpdateUserRequest request = new UpdateUserRequest(1L, "newUser", "newPass", "new@example.com", "Store Administrator");
        User existingUser = new User();
        existingUser.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        User updated = userService.updateUser(request);

        assertEquals("newUser", updated.getUsername());
        assertEquals("newPass", updated.getPassword());
        assertEquals("new@example.com", updated.getEmail());
        assertEquals(Role.STORE_ADMINISTRATOR, updated.getRole());
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_NotFound() {
        UpdateUserRequest request = new UpdateUserRequest(404L, "x", "y", "z", "Store Administrator");
        when(userRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.updateUser(request));
        verify(userRepository, times(1)).findById(404L);
        verify(userRepository, times(0)).save(any(User.class));
    }

    @Test
    void testDeleteUser_Success() {
        doNothing().when(userRepository).deleteById(10L);
        userService.deleteUser(10L);
        verify(userRepository, times(1)).deleteById(10L);
    }
}
