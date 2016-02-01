BEGIN;

CREATE TABLE appsync_umbrella (
    id INT NOT NULL,
    name VARCHAR NOT NULL UNIQUE,
    orgsync_id INT NOT NULL UNIQUE,
    PRIMARY KEY(id)
);

CREATE SEQUENCE appsync_umbrella_seq;

CREATE TABLE appsync_umbrella_admin (
    id INT NOT NULL,
    username VARCHAR NOT NULL,
    umbrella_id INT REFERENCES appsync_umbrella(orgsync_id),
    PRIMARY KEY(id)
);

CREATE SEQUENCE appsync_umbrella_admin_seq;

CREATE TABLE appsync_portal (
    orgsync_id INT NOT NULL UNIQUE,
    name VARCHAR NOT NULL UNIQUE,
    umbrella_id INT REFERENCES appsync_umbrella(orgsync_id),
    PRIMARY KEY(orgsync_id)
);

CREATE TABLE appsync_event (
    id INT NOT NULL,
    description VARCHAR NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE appsync_log_entry (
    id INT NOT NULL,
    type INT NOT NULL REFERENCES appsync_event(id),
    description VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    occurred_on INT NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE appsync_settings (
    setting VARCHAR NOT NULL,
    value VARCHAR NOT NULL,
    PRIMARY KEY(setting)
);

COMMIT;
