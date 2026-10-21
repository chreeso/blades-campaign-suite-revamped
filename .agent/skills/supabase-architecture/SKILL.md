---
name: supabase-architecture
description: Directs database schema design, migrations, and Row-Level Security (RLS) policies for multi-campaign isolation and role-based permissions in Supabase.
---

# Supabase Architecture & Multi-Campaign Isolation Skill

## Purpose
Enforces secure, multi-tenant campaign architecture in PostgreSQL / Supabase, ensuring that users can seamlessly participate as Game Masters in certain campaigns and Players in others, with strict database-level security policies.

## Role & Visibility Model

### 1. Campaign Membership Table
```sql
CREATE TYPE campaign_role AS ENUM ('gm', 'player');

CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role campaign_role NOT NULL DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);
```

### 2. Visibility Levels
Entity tables (clocks, journal entries, NPCs, factions) include:
```sql
CREATE TYPE content_visibility AS ENUM ('gm_only', 'campaign_public', 'character_private');
```

## Row-Level Security (RLS) Rules
Always enable RLS on every table:
1. **Helper Functions**:
   ```sql
   -- Check if current user is the GM of a campaign
   CREATE OR REPLACE FUNCTION is_campaign_gm(c_id UUID)
   RETURNS BOOLEAN AS $$
     SELECT EXISTS (
       SELECT 1 FROM campaign_members
       WHERE campaign_id = c_id AND user_id = auth.uid() AND role = 'gm'
     );
   $$ LANGUAGE sql SECURITY DEFINER;

   -- Check if current user is a participant of a campaign
   CREATE OR REPLACE FUNCTION is_campaign_member(c_id UUID)
   RETURNS BOOLEAN AS $$
     SELECT EXISTS (
       SELECT 1 FROM campaign_members
       WHERE campaign_id = c_id AND user_id = auth.uid()
     );
   $$ LANGUAGE sql SECURITY DEFINER;
   ```

2. **Entity Access Policy (e.g. Clocks / Journal)**:
   - **SELECT**:
     - Allow if `is_campaign_gm(campaign_id) = true`
     - OR if `is_campaign_member(campaign_id) = true` AND `visibility = 'campaign_public'`
     - OR if `visibility = 'character_private'` AND `created_by = auth.uid()`
   - **INSERT / UPDATE / DELETE**:
     - GM has write access to all campaign entities.
     - Players can only update their own assigned characters and private journal entries.

## Performance & Migration Guidelines
- Always add foreign key indices on `(campaign_id, user_id)`.
- Use Supabase Realtime channels scoped to `campaign_id` for clock updates and character sheet synchronization.
- Never bypass RLS in client-facing API routes or components; always rely on `@supabase/ssr` with authenticated server clients.
