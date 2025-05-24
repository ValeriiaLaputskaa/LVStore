package org.example.lvstore.config.security;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.payload.user.CreateUserRequest;
import org.example.lvstore.service.UserService;
import org.example.lvstore.service.enums.Role;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = new DefaultOAuth2UserService().loadUser(userRequest);
        String email = oauth2User.getAttribute("email");
        String first_name = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");

        String username = String.format("%s %s", first_name, lastName);
        CreateUserRequest request = new CreateUserRequest(username, lastName, email, Role.SELLER.getTitle());
        userService.registerUserIfAbsent(request);
        return oauth2User;
    }
}
