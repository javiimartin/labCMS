CREATE TABLE IF NOT EXISTS lab (
    lab_code SERIAL PRIMARY KEY,
    lab_name VARCHAR(100) UNIQUE,
    lab_description TEXT NOT NULL,
    lab_objectives TEXT NOT NULL,
    lab_proyects TEXT NOT NULL,
    lab_images VARCHAR(255),
    lab_video VARCHAR(255),    
    lab_podcast VARCHAR(255)   
);

CREATE TABLE IF NOT EXISTS dep_user (
    user_code SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_surname VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_gender VARCHAR(10) NOT NULL,
    user_age INTEGER NOT NULL,
    user_degree VARCHAR(100) NOT NULL,
    user_zipcode VARCHAR(10) NOT NULL,
    user_isnear BOOLEAN
);

CREATE TABLE IF NOT EXISTS lab_followers (
    lab_code INT,
    user_code INT,
    PRIMARY KEY (lab_code, user_code),
    FOREIGN KEY (lab_code) REFERENCES lab(lab_code),
    FOREIGN KEY (user_code) REFERENCES dep_user(user_code)
);

CREATE TABLE IF NOT EXISTS dep_admin (
    user_code SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_surname VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    user_password VARCHAR(100) NOT NULL,
    is_superadmin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_tokens (
    user_id INTEGER PRIMARY KEY,
    token TEXT NOT NULL
);