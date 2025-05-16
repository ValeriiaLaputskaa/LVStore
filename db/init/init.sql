CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    username VARCHAR(50)                                                NOT NULL UNIQUE,
    password VARCHAR(100)                                               NOT NULL,
    email    VARCHAR(100)                                               NOT NULL UNIQUE,
    role     VARCHAR(20) CHECK (role IN ('Store Administrator', 'Seller', 'Warehouse Manager')) NOT NULL
);

CREATE TABLE store
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    admin_id INTEGER      REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE warehouse
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    location   VARCHAR(255),
    manager_id INTEGER      REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE product
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL,
    category    VARCHAR(50),
    barcode     VARCHAR(50) UNIQUE,
    price       NUMERIC(10, 2) NOT NULL,
    description TEXT
);

CREATE TABLE stock
(
    id         SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product (id) ON DELETE CASCADE,
    store_id   INTEGER REFERENCES store (id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL CHECK (quantity >= 0),
    min_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (min_quantity >= 0)
);

CREATE TABLE warehouse_stock
(
    id           SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouse (id) ON DELETE CASCADE,
    product_id   INTEGER REFERENCES product (id) ON DELETE CASCADE,
    quantity     INTEGER NOT NULL CHECK (quantity >= 0)
);

CREATE TABLE orders
(
    id         SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product (id) ON DELETE CASCADE,
    store_id   INTEGER REFERENCES store (id) ON DELETE CASCADE,
    created_by INTEGER                                                                           REFERENCES users (id) ON DELETE SET NULL,
    status     VARCHAR(20) CHECK (status IN ('Нове', 'Підтверджене', 'Відправлене', 'Отримане')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity   INTEGER                                                                           NOT NULL CHECK (quantity > 0)
);
