-- Clean up
TRUNCATE place_image, place RESTART IDENTITY;

-- Place 1: Bairro Alto
INSERT INTO place (id, name, category, description, location)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bairro Alto',
    'Nightlife & Culture',
    'A central district of Lisbon known for its narrow cobbled streets, vibrant nightlife, and traditional Fado houses.',
    ST_SetSRID(ST_MakePoint(-9.1441, 38.7128), 4326)
);
INSERT INTO place_image (place_id, url, description, is_primary) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://storage.googleapis.com/orbita-images-prod/places/bairro-alto-1.png', 'Street view of Bairro Alto at night', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://storage.googleapis.com/orbita-images-prod/places/bairro-alto-2.png', 'Traditional Lisbon architecture in Bairro Alto', false);

-- Place 2: Torre de Belém
INSERT INTO place (id, name, category, description, location)
VALUES (
    'b1ffcd88-0d1c-5fa9-cc7e-7cc0ce491b22',
    'Torre de Belém',
    'Historical Landmark',
    'A 16th-century fortification located on the northern bank of the Tagus River, serving as a ceremonial gateway to Lisbon.',
    ST_SetSRID(ST_MakePoint(-9.2158, 38.6916), 4326)
);
INSERT INTO place_image (place_id, url, description, is_primary) VALUES
('b1ffcd88-0d1c-5fa9-cc7e-7cc0ce491b22', 'https://storage.googleapis.com/orbita-images-prod/places/torre-de-belem-1.png', 'The Belém Tower against the Tagus River', true),
('b1ffcd88-0d1c-5fa9-cc7e-7cc0ce491b22', 'https://storage.googleapis.com/orbita-images-prod/places/torre-de-belem-2.png', 'Intricate Manueline carvings on the tower facade', false);

-- Place 3: Castelo de São Jorge
INSERT INTO place (id, name, category, description, location)
VALUES (
    'e422fa11-3a4f-82d2-ff01-0ff3fa724e55',
    'Castelo de São Jorge',
    'Castle & Museum',
    'A historic castle overlooking the city of Lisbon, offering panoramic views and a glimpse into the city''s Moorish history.',
    ST_SetSRID(ST_MakePoint(-9.1335, 38.7139), 4326)
);

INSERT INTO place_image (place_id, url, description, is_primary) VALUES
('e422fa11-3a4f-82d2-ff01-0ff3fa724e55', 'https://storage.googleapis.com/orbita-images-prod/places/castelo-de-sao-jorge-1.png', 'View of the castle walls overlooking Lisbon', true);
