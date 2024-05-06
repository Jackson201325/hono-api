-- Enable the extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  role VARCHAR(255) DEFAULT 'COUPLE' NOT NULL,
  is_onboarded BOOLEAN DEFAULT false NOT NULL,
  has_pybank_account BOOLEAN DEFAULT false NOT NULL,
  is_magic_link_login BOOLEAN DEFAULT false NOT NULL,
  onboarding_step VARCHAR(255) DEFAULT '1' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Account Table
CREATE TABLE accounts (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- UserAccount Join Table
CREATE TABLE user_accounts (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  account_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Session Table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- UserSession Join Table
CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Categories Table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(255),
  date TIMESTAMP,
  location VARCHAR(255),
  url VARCHAR(255) UNIQUE,
  event_type VARCHAR(255) DEFAULT 'WEDDING',
  country VARCHAR(255),
  primary_user_id UUID,
  secondary_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (primary_user_id) REFERENCES users (id),
  FOREIGN KEY (secondary_user_id) REFERENCES users (id),
  CHECK (
    primary_user_id IS NOT NULL
    OR secondary_user_id IS NOT NULL
  )
);

-- Wishlist Table
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  description TEXT,
  total_price VARCHAR(255) DEFAULT '0',
  total_gifts VARCHAR(255) DEFAULT '0',
  event_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events (id)
);

-- Giftlist Table
CREATE TABLE giftlists (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_price VARCHAR DEFAULT '0',
  total_gifts VARCHAR(255) DEFAULT '0',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  category_id UUID,
  event_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Gifts Table
CREATE TABLE gifts (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price VARCHAR DEFAULT '0',
  image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  category_id UUID,
  event_id UUID,
  giftlist_id UUID,
  source_gift_id UUID,
  wishlist_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories (id),
  FOREIGN KEY (event_id) REFERENCES events (id),
  FOREIGN KEY (giftlist_id) REFERENCES giftlists (id),
  FOREIGN KEY (wishlist_id) REFERENCES wishlists (id)
);

-- Wishlist Gift Join Table
CREATE TABLE wishlist_gifts (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  event_id UUID NOT NULL,
  gift_id UUID NOT NULL,
  wishlist_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wishlist_id) REFERENCES wishlists (id),
  FOREIGN KEY (gift_id) REFERENCES gifts (id),
  FOREIGN KEY (event_id) REFERENCES events (id)
);

------------------------------------------------------
--- Create Indexes ----------------------------------
------------------------------------------------------
-- Index on Users
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_role ON users (role);

-- Index on Accounts
CREATE INDEX idx_accounts_user_id ON accounts (user_id);

CREATE INDEX idx_accounts_provider ON accounts (provider);

-- Index on Sessions
CREATE INDEX idx_sessions_user_id ON sessions (user_id);

-- Index on Events
CREATE INDEX idx_events_primary_user_id ON events (primary_user_id);

CREATE INDEX idx_events_secondary_user_id ON events (secondary_user_id);

-- Index on Gifts
CREATE INDEX idx_gifts_category_id ON gifts (category_id);

CREATE INDEX idx_gifts_giftlist_id ON gifts (giftlist_id);

CREATE INDEX idx_gifts_wishlist_id ON gifts (wishlist_id);

CREATE INDEX idx_gifts_is_default ON gifts (is_default);

-- Index on Giftlists and Wishlists
CREATE INDEX idx_giftlists_event_id ON giftlists (event_id);

CREATE INDEX idx_wishlists_event_id ON wishlists (event_id);

---------------------------------------------
----- Functions -----------------------------
---------------------------------------------
-- Trigger function to update total_price and total_gifts on wishlist updates
CREATE
OR REPLACE FUNCTION update_wishlist_total () RETURNS TRIGGER AS $$
BEGIN
  IF NEW.wishlist_id IS NOT NULL OR OLD.wishlist_id IS NOT NULL THEN
    IF TG_OP = 'DELETE' THEN
      UPDATE wishlists
      SET total_price = COALESCE((SELECT SUM(price::numeric) FROM gifts WHERE wishlist_id = OLD.wishlist_id), 0)::text,
        total_gifts = COALESCE((SELECT COUNT(*) FROM gifts WHERE wishlist_id = OLD.wishlist_id), 0)::text
      WHERE id = OLD.wishlist_id;
    ELSE
      UPDATE wishlists
      SET total_price = COALESCE((SELECT SUM(price::numeric) FROM gifts WHERE wishlist_id = NEW.wishlist_id), 0)::text,
        total_gifts = COALESCE((SELECT COUNT(*) FROM gifts WHERE wishlist_id = NEW.wishlist_id), 0)::text
      WHERE id = NEW.wishlist_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

-- Consolidated trigger function to update total_price and total_gifts
CREATE
OR REPLACE FUNCTION update_giftlist_total () RETURNS TRIGGER AS $$
BEGIN
    -- Determine the operation type and handle accordingly
  IF TG_OP = 'DELETE' THEN
    -- Update the total_price and total_gifts when a gift is deleted
    UPDATE giftlists
    SET total_price = COALESCE((SELECT SUM(price::numeric) FROM gifts WHERE giftlist_id = OLD.giftlist_id), 0)::text,
        total_gifts = COALESCE((SELECT COUNT(*) FROM gifts WHERE giftlist_id = OLD.giftlist_id), 0)::text
    WHERE id = OLD.giftlist_id;
  ELSE
    -- Update the total_price and total_gifts when a new gift is added or updated
    UPDATE giftlists
    SET total_price = COALESCE((SELECT SUM(price::numeric) FROM gifts WHERE giftlist_id = NEW.giftlist_id), 0)::text,
        total_gifts = COALESCE((SELECT COUNT(*) FROM gifts WHERE giftlist_id = NEW.giftlist_id), 0)::text
    WHERE id = NEW.giftlist_id;
  END IF;
  RETURN NULL; -- Returning NULL is appropriate for AFTER triggers
END;
$$ LANGUAGE 'plpgsql';

CREATE
OR REPLACE FUNCTION update_updated_at_column () RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger function to update total_price and total_gifts on giftlist updates
CREATE
OR REPLACE FUNCTION update_giftlist_total () RETURNS TRIGGER AS $$
BEGIN
    IF NEW.giftlist_id IS NOT NULL OR OLD.giftlist_id IS NOT NULL THEN
        IF TG_OP = 'DELETE' THEN
            UPDATE giftlists
            SET total_price = COALESCE((SELECT SUM(price::numeric) FROM gifts WHERE giftlist_id = OLD.giftlist_id), 0)::text,
                total_gifts = COALESCE((SELECT COUNT(*) FROM gifts WHERE giftlist_id = OLD.giftlist_id), 0)::text
            WHERE id = OLD.giftlist_id;
        ELSE
            UPDATE giftlists
            SET total_price = COALESCE((SELECT SUM(price::numeric) FROM gifts WHERE giftlist_id = NEW.giftlist_id), 0)::text,
                total_gifts = COALESCE((SELECT COUNT(*) FROM gifts WHERE giftlist_id = NEW.giftlist_id), 0)::text
                  WHERE id = NEW.giftlist_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

------------------------------------------------------
------Triggers ---------------------------------------
------------------------------------------------------
-- Trigger for updating upated at
CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_accounts_updated_at BEFORE
UPDATE ON accounts FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_sessions_updated_at BEFORE
UPDATE ON user_accounts FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_sessions_updated_at BEFORE
UPDATE ON user_sessions FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_sessions_updated_at BEFORE
UPDATE ON sessions FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_events_updated_at BEFORE
UPDATE ON events FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_giftlists_updated_at BEFORE
UPDATE ON wishlists FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_giftlists_updated_at BEFORE
UPDATE ON giftlists FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_gifts_updated_at BEFORE
UPDATE ON gifts FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_gifts_updated_at BEFORE
UPDATE ON wishlist_gifts FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

-- Create triggers to handle inserts, updates, and deletes on gifts
CREATE TRIGGER handle_gifts_after_insert_update
AFTER INSERT
OR
UPDATE ON gifts FOR EACH ROW
EXECUTE FUNCTION update_giftlist_total ();

CREATE TRIGGER handle_gifts_after_delete
AFTER DELETE ON gifts FOR EACH ROW
EXECUTE FUNCTION update_giftlist_total ();

-- Attach triggers to handle gifts table operations
CREATE TRIGGER handle_gifts_wishlist_after_insert_update
AFTER INSERT
OR
UPDATE ON gifts FOR EACH ROW
EXECUTE FUNCTION update_wishlist_total ();

CREATE TRIGGER handle_gifts_wishlist_after_delete
AFTER DELETE ON gifts FOR EACH ROW
EXECUTE FUNCTION update_wishlist_total ();
