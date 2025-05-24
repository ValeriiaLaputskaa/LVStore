package org.example.lvstore.service.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    STORE_ADMINISTRATOR("Store_Administrator"),
    SELLER("Seller"),
    WAREHOUSE_MANAGER("Warehouse_Manager");

    private final String title;
}
