-- Think Marketplace Database Schema
-- ==================================
-- Run this in your Supabase SQL editor to set up the database.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE listing_type AS ENUM ('app', 'tool', 'agent');
CREATE TYPE listing_status AS ENUM ('live', 'beta', 'concept');
CREATE TYPE listing_visibility AS ENUM ('featured', 'public', 'unlisted');
CREATE TYPE review_state AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE mind_runtime AS ENUM ('local', 'server', 'hybrid');
CREATE TYPE interface_type AS ENUM ('web', 'desktop', 'extension', 'api', 'mobile');
CREATE TYPE wallet_auth_status AS ENUM ('yes', 'no', 'planned');

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builders table
CREATE TABLE builders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    twitter VARCHAR(100),
    github VARCHAR(100),
    discord VARCHAR(100),
    wallet_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    type listing_type NOT NULL,
    short_description VARCHAR(140) NOT NULL,
    long_description TEXT,
    status listing_status DEFAULT 'concept',
    tags TEXT[] DEFAULT '{}',
    icon_url TEXT,
    thumbnail_url TEXT, -- Cover image for featured cards
    builder_id UUID REFERENCES builders(id) ON DELETE CASCADE,
    visibility listing_visibility DEFAULT 'public',
    review_state review_state DEFAULT 'pending',
    
    -- Links (stored as JSONB for flexibility)
    links JSONB DEFAULT '{}',
    
    -- Media (stored as JSONB array)
    media JSONB DEFAULT '[]',
    
    -- Think Fit (stored as JSONB for structured data)
    think_fit JSONB DEFAULT '{}',
    
    -- Full-text search vector
    search_vector tsvector,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing categories junction table (many-to-many)
CREATE TABLE listing_categories (
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, category_id)
);

-- Featured collections table
CREATE TABLE featured_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Featured collection listings junction table
CREATE TABLE featured_collection_listings (
    collection_id UUID REFERENCES featured_collections(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, listing_id)
);

-- =====================
-- Indexes
-- =====================

-- Listings indexes
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_visibility ON listings(visibility);
CREATE INDEX idx_listings_review_state ON listings(review_state);
CREATE INDEX idx_listings_builder_id ON listings(builder_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_search_vector ON listings USING GIN(search_vector);

-- Builders indexes
CREATE INDEX idx_builders_slug ON builders(slug);

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories(slug);

-- =====================
-- Full-text search
-- =====================

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.long_description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER listings_search_vector_update
    BEFORE INSERT OR UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_search_vector();

-- =====================
-- Auto-update timestamps
-- =====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER builders_updated_at
    BEFORE UPDATE ON builders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================
-- Row Level Security (RLS)
-- =====================

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_collections ENABLE ROW LEVEL SECURITY;

-- Public read access for approved/visible content
CREATE POLICY "Public can view approved listings" ON listings
    FOR SELECT USING (
        review_state = 'approved' AND 
        visibility IN ('featured', 'public')
    );

CREATE POLICY "Public can view builders" ON builders
    FOR SELECT USING (true);

CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view active featured collections" ON featured_collections
    FOR SELECT USING (is_active = true);

-- Authenticated users can submit listings (pending review)
CREATE POLICY "Authenticated users can insert listings" ON listings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- Helper functions
-- =====================

-- Function to search listings
CREATE OR REPLACE FUNCTION search_listings(
    search_query TEXT,
    type_filter listing_type DEFAULT NULL,
    status_filter listing_status DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    type listing_type,
    short_description VARCHAR,
    icon_url TEXT,
    status listing_status,
    builder_id UUID,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.slug,
        l.type,
        l.short_description,
        l.icon_url,
        l.status,
        l.builder_id,
        ts_rank(l.search_vector, websearch_to_tsquery('english', search_query)) as rank
    FROM listings l
    WHERE 
        l.review_state = 'approved'
        AND l.visibility IN ('featured', 'public')
        AND (search_query IS NULL OR search_query = '' OR l.search_vector @@ websearch_to_tsquery('english', search_query))
        AND (type_filter IS NULL OR l.type = type_filter)
        AND (status_filter IS NULL OR l.status = status_filter)
    ORDER BY 
        CASE WHEN l.visibility = 'featured' THEN 0 ELSE 1 END,
        rank DESC,
        l.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;
