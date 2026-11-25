-- ==============================================================================
-- Migration: 20261125000005_lock_poster_storage.sql
-- The "posters" bucket stays publicly READABLE. Writes only happen through
-- signed upload URLs issued by the admin-only API route. storage.objects has
-- no INSERT/UPDATE/DELETE policies for anon/authenticated, so nobody else can
-- write. This migration additionally enforces size and type at the bucket level.
-- ==============================================================================

UPDATE storage.buckets
SET file_size_limit = 8388608, -- 8 MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'posters';
