package org.example.lvstore.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
@RequiredArgsConstructor
public class CustomJwtAuthenticationConverter {

    private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter;

    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = jwtGrantedAuthoritiesConverter.convert(jwt);
        return new JwtAuthenticationToken(jwt, authorities);
    }
}
