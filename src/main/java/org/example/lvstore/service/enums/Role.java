package org.example.lvstore.service.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum Role {
    STORE_ADMINISTRATOR("Store_Administrator"),
    SELLER("Seller"),
    WAREHOUSE_MANAGER("Warehouse_Manager");

    private final String title;

    public static Role fromTitle(String title) {
        return Arrays.stream(Role.values())
                .filter(r -> r.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + title));
    }
}
