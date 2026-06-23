-- Database Schema for Trip Planning Application
-- Place this in your MySQL database (e.g. tripdb)

CREATE TABLE IF NOT EXISTS cafes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address VARCHAR(255) DEFAULT NULL,
    description TEXT,
    mood VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(50) PRIMARY KEY,
    initiator_id VARCHAR(255) NOT NULL,
    cafe_id INT,
    budget VARCHAR(50),
    mood VARCHAR(255) NOT NULL,
    expected_players INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open',
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_players (
    trip_id VARCHAR(50) NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    username VARCHAR(255),
    score INT DEFAULT 0,
    image LONGTEXT, -- Stores the base64 string representation of the captured face image
    PRIMARY KEY (trip_id, player_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_voters (
    trip_id VARCHAR(50) NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (trip_id, player_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS votes (
    trip_id VARCHAR(50) NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    PRIMARY KEY (trip_id, player_id, date),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_dates (
    trip_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    PRIMARY KEY (trip_id, date),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(255) PRIMARY KEY,
    trip_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for Cafes (Matches the 20 cafes inside DB.json but capitalized to match server choices)
INSERT INTO cafes (id, name, location, address, description, mood) VALUES
(1, 'Brouwers Vojta', 'Antwerp', 'Sint-Aldegondiskaai 44, 2000 Antwerpen', 'Popular beer café with Belgian craft brews and lively atmosphere', 'Beer & Banter'),
(2, 'De Koninck Brewery Café', 'Antwerp', 'Mechelsesteenweg 291, 2018 Antwerpen', 'Historic brewery café serving Antwerp''s famous De Koninck beer', 'Beer & Banter'),
(3, 'Café Slaghuis', 'Antwerp', 'Nationalestraat 10, 2000 Antwerpen', 'Traditional Antwerp café with Belgian beer selection', 'Beer & Banter'),
(4, 'The Distillery', 'Antwerp', 'Groenplaats 21, 2000 Antwerpen', 'Historic pub in the city center with craft beers and spirits', 'Beer & Banter'),
(5, 'Puur Cocktail Bar', 'Antwerp', 'Vlaeykensgang, Oude Koornmarkt 16, 2000 Antwerpen', 'Craft cocktail bar with inventive drinks and minimalist design', 'Cocktails, darling'),
(6, 'Bar Bohem', 'Antwerp', 'Kammenstraat 55, 2000 Antwerpen', 'Bohemian cocktail bar with creative mixology and eclectic vibe', 'Cocktails, darling'),
(7, 'Café de Pelgrom', 'Antwerp', 'Pelgrimsstraat 15, 2000 Antwerpen', 'Historic café-bar with cocktails and vintage atmosphere', 'Cocktails, darling'),
(8, 'The Shelter', 'Antwerp', 'Grote Markt 12, 2000 Antwerpen', 'Underground speakeasy-style cocktail bar with craft drinks', 'Cocktails, darling'),
(9, 'Vinoteca', 'Antwerp', 'Kloosterstraat 20, 2000 Antwerpen', 'Wine bar with curated selection and knowledgeable staff', 'Wine & refined'),
(10, 'Wijnbar Bacchus', 'Antwerp', 'Gierstraat 2, 2000 Antwerpen', 'Elegant wine bar with fine selections and tapas pairings', 'Wine & refined'),
(11, 'Château Rouge', 'Antwerp', 'Minderbroedersrui 10, 2000 Antwerpen', 'Refined wine lounge with French-inspired ambiance', 'Wine & refined'),
(12, 'De Groote Witte Arend', 'Antwerp', 'Reyndersstraat 18, 2000 Antwerpen', 'Traditional Belgian beer hall with rustic charm', 'Beer & Banter'),
(13, 'Motley', 'Antwerp', 'Scheldestraat 44, 2000 Antwerpen', 'Trendy café with creative non-alcoholic drinks and laid-back vibe', 'Mocktails & chill'),
(14, 'Juice Lab', 'Antwerp', 'Reyndersstraat 2, 2000 Antwerpen', 'Health-focused juice bar with smoothies and wellness drinks', 'Mocktails & chill'),
(15, 'Café Pelgrom', 'Antwerp', 'Pelgrimsstraat 15, 2000 Antwerpen', 'Cozy café serving herbal teas and fresh juices', 'Mocktails & chill'),
(16, 'Het Fornuis', 'Antwerp', 'Reyndersstraat 24, 2000 Antwerpen', 'Casual neighbourhood bar with Belgian beers and pub atmosphere', 'Beer & Banter'),
(17, 'Café Local', 'Antwerp', 'Waalsekaai 25, 2000 Antwerpen', 'Authentic local bar with craft beer focus and friendly crowd', 'Beer & Banter'),
(18, 'The Lab', 'Antwerp', 'Melkmarkt 15, 2000 Antwerpen', 'Modern cocktail laboratory with experimental drinks', 'Cocktails, darling'),
(19, 'Terra Wines', 'Antwerp', 'Vrijdagmarkt 10, 2000 Antwerpen', 'Natural wine bar with organic selections and intimate setting', 'Wine & refined'),
(20, 'Zen Café', 'Antwerp', 'Nationalestraat 60, 2000 Antwerpen', 'Peaceful sanctuary with herbal teas and wellness focus', 'Mocktails & chill')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    location = VALUES(location),
    address = VALUES(address),
    description = VALUES(description),
    mood = VALUES(mood);
