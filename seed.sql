DROP TABLE IF EXISTS plant_relations;
DROP TABLE IF EXISTS plants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    planting_start INT2,
    planting_end INT2,
    harvesting_start INT2,
    harvesting_end INT2,
    water INT,
    shadow BOOLEAN,
    height INT2,
    spread INT2,
    body_water BOOLEAN,
    is_tree BOOLEAN,
    created_by INT REFERENCES users(id)
);

CREATE TABLE plant_relations (
    id SERIAL PRIMARY KEY,
    plant_a_id INT NOT NULL REFERENCES plants(id),
    plant_b_id INT NOT NULL REFERENCES plants(id),
    is_companion BOOLEAN NOT NULL,
    explanation TEXT,
    created_by INT REFERENCES users(id),
    UNIQUE (plant_a_id, plant_b_id, is_companion)
);

-- Seed plants (no created_by since no users exist yet)
INSERT INTO plants (name, planting_start, planting_end, harvesting_start, harvesting_end, water, shadow, height, spread, body_water, is_tree)
VALUES
    ('Tomato',   3, 5,  7, 10, 800, false, 150, 60,  false, false),
    ('Basil',    4, 6,  6, 10, 400, false, 45,  30,  false, false),
    ('Carrot',   3, 7,  6, 11, 500, false, 30,  15,  true,  false),
    ('Rosemary', 3, 5,  1, 12, 300, false, 120, 90,  false, false),
    ('Pepper',   4, 6,  7, 10, 600, false, 90,  45,  false, false);

-- Seed relationships
INSERT INTO plant_relations (plant_a_id, plant_b_id, is_companion, explanation)
VALUES
    (1, 2, true,  'Basil repels aphids and improves tomato flavor.'),
    (1, 4, true,  'Rosemary deters tomato hornworms.'),
    (1, 5, false, 'Tomatoes and peppers compete for nutrients and share diseases.');
