-- ====================================================================
-- Blades in the Dark Campaign Suite — Database Schema & RLS Policies
-- ====================================================================

-- 1. Custom Types & Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE campaign_role AS ENUM ('gm', 'player');
CREATE TYPE content_visibility AS ENUM ('gm_only', 'campaign_public', 'character_private');
CREATE TYPE clock_kind AS ENUM ('obstacle', 'danger', 'project', 'tug_of_war');
CREATE TYPE hold_level AS ENUM ('Weak', 'Strong');
CREATE TYPE load_category AS ENUM ('Light', 'Normal', 'Heavy');

-- 2. Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Campaign Members (Multi-tenancy & Role isolation)
CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role campaign_role NOT NULL DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_campaign_members_lookup ON campaign_members(campaign_id, user_id);

-- RLS Helper functions
CREATE OR REPLACE FUNCTION is_campaign_gm(c_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = c_id AND user_id = auth.uid() AND role = 'gm'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_campaign_member(c_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = c_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Crews
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  playbook TEXT NOT NULL CHECK (playbook IN ('Assassins', 'Bravos', 'Cult', 'Hawkers', 'Shadows', 'Smugglers')),
  rep INTEGER NOT NULL DEFAULT 0 CHECK (rep >= 0 AND rep <= 12),
  tier INTEGER NOT NULL DEFAULT 0 CHECK (tier >= 0 AND tier <= 5),
  hold hold_level NOT NULL DEFAULT 'Strong',
  heat INTEGER NOT NULL DEFAULT 0 CHECK (heat >= 0 AND heat <= 9),
  wanted_level INTEGER NOT NULL DEFAULT 0 CHECK (wanted_level >= 0 AND wanted_level <= 4),
  coin_vault INTEGER NOT NULL DEFAULT 0,
  vault_capacity INTEGER NOT NULL DEFAULT 4,
  hunting_grounds TEXT,
  lair TEXT,
  special_abilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  upgrades JSONB NOT NULL DEFAULT '[]'::jsonb,
  claims JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Characters (Scoundrels)
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  alias TEXT,
  playbook TEXT NOT NULL CHECK (playbook IN ('Cutter', 'Hound', 'Leech', 'Lurk', 'Slide', 'Spider', 'Whisper')),
  heritage TEXT,
  background TEXT,
  vice TEXT,
  vice_purveyor TEXT,
  stress INTEGER NOT NULL DEFAULT 0 CHECK (stress >= 0 AND stress <= 9),
  trauma JSONB NOT NULL DEFAULT '[]'::jsonb,
  harm JSONB NOT NULL DEFAULT '{"level1": ["", ""], "level2": ["", ""], "level3": ""}'::jsonb,
  armor_used JSONB NOT NULL DEFAULT '{"standard": false, "heavy": false, "special": false}'::jsonb,
  action_dots JSONB NOT NULL DEFAULT '{
    "hunt": 0, "study": 0, "survey": 0, "tinker": 0,
    "finesse": 0, "prowl": 0, "skirmish": 0, "wreck": 0,
    "attune": 0, "command": 0, "consort": 0, "sway": 0
  }'::jsonb,
  playbook_xp INTEGER NOT NULL DEFAULT 0 CHECK (playbook_xp >= 0 AND playbook_xp <= 8),
  insight_xp INTEGER NOT NULL DEFAULT 0 CHECK (insight_xp >= 0 AND insight_xp <= 6),
  prowess_xp INTEGER NOT NULL DEFAULT 0 CHECK (prowess_xp >= 0 AND prowess_xp <= 6),
  resolve_xp INTEGER NOT NULL DEFAULT 0 CHECK (resolve_xp >= 0 AND resolve_xp <= 6),
  coin INTEGER NOT NULL DEFAULT 0 CHECK (coin >= 0 AND coin <= 4),
  stash INTEGER NOT NULL DEFAULT 0 CHECK (stash >= 0 AND stash <= 40),
  load_level load_category NOT NULL DEFAULT 'Normal',
  special_abilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Clocks (Linear progress bar engine)
CREATE TABLE clocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  clock_type clock_kind NOT NULL DEFAULT 'obstacle',
  max_segments INTEGER NOT NULL CHECK (max_segments IN (4, 6, 8, 12)),
  current_segments INTEGER NOT NULL DEFAULT 0,
  visibility content_visibility NOT NULL DEFAULT 'campaign_public',
  color_theme TEXT DEFAULT 'slate',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT segments_bounds CHECK (current_segments >= 0 AND current_segments <= max_segments)
);

-- 7. Factions
CREATE TABLE factions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1 CHECK (tier >= 0 AND tier <= 6),
  hold hold_level NOT NULL DEFAULT 'Strong',
  status INTEGER NOT NULL DEFAULT 0 CHECK (status >= -3 AND status <= 3),
  description TEXT,
  goals TEXT,
  clock_id UUID REFERENCES clocks(id) ON DELETE SET NULL,
  visibility content_visibility NOT NULL DEFAULT 'campaign_public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. NPCs
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  faction_id UUID REFERENCES factions(id) ON DELETE SET NULL,
  affiliation TEXT,
  quirk TEXT,
  notes TEXT,
  visibility content_visibility NOT NULL DEFAULT 'campaign_public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_type TEXT NOT NULL DEFAULT 'session',
  visibility content_visibility NOT NULL DEFAULT 'campaign_public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Transactions (Economy Ledger)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency_target TEXT NOT NULL CHECK (currency_target IN ('purse', 'stash', 'crew_vault', 'rep', 'heat')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Campaigns
CREATE POLICY campaigns_select ON campaigns FOR SELECT
  USING (is_campaign_member(id) OR created_by = auth.uid());
CREATE POLICY campaigns_insert ON campaigns FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY campaigns_update ON campaigns FOR UPDATE
  USING (is_campaign_gm(id) OR created_by = auth.uid());
CREATE POLICY campaigns_delete ON campaigns FOR DELETE
  USING (is_campaign_gm(id) OR created_by = auth.uid());

-- Campaign Members
CREATE POLICY campaign_members_select ON campaign_members FOR SELECT
  USING (is_campaign_member(campaign_id));
CREATE POLICY campaign_members_all_gm ON campaign_members FOR ALL
  USING (is_campaign_gm(campaign_id));

-- Crews
CREATE POLICY crews_select ON crews FOR SELECT
  USING (is_campaign_member(campaign_id));
CREATE POLICY crews_modify ON crews FOR ALL
  USING (is_campaign_gm(campaign_id) OR is_campaign_member(campaign_id));

-- Characters
CREATE POLICY characters_select ON characters FOR SELECT
  USING (is_campaign_member(campaign_id));
CREATE POLICY characters_update ON characters FOR UPDATE
  USING (user_id = auth.uid() OR is_campaign_gm(campaign_id));
CREATE POLICY characters_insert ON characters FOR INSERT
  WITH CHECK (is_campaign_member(campaign_id));
CREATE POLICY characters_delete ON characters FOR DELETE
  USING (user_id = auth.uid() OR is_campaign_gm(campaign_id));

-- Clocks (Filtered by visibility)
CREATE POLICY clocks_select ON clocks FOR SELECT
  USING (
    is_campaign_gm(campaign_id) OR
    (is_campaign_member(campaign_id) AND visibility = 'campaign_public') OR
    (created_by = auth.uid() AND visibility = 'character_private')
  );
CREATE POLICY clocks_insert ON clocks FOR INSERT
  WITH CHECK (is_campaign_member(campaign_id));
CREATE POLICY clocks_update ON clocks FOR UPDATE
  USING (is_campaign_gm(campaign_id) OR created_by = auth.uid());
CREATE POLICY clocks_delete ON clocks FOR DELETE
  USING (is_campaign_gm(campaign_id) OR created_by = auth.uid());

-- Factions (Filtered by visibility)
CREATE POLICY factions_select ON factions FOR SELECT
  USING (
    is_campaign_gm(campaign_id) OR
    (is_campaign_member(campaign_id) AND visibility = 'campaign_public')
  );
CREATE POLICY factions_all_gm ON factions FOR ALL
  USING (is_campaign_gm(campaign_id));

-- NPCs
CREATE POLICY npcs_select ON npcs FOR SELECT
  USING (
    is_campaign_gm(campaign_id) OR
    (is_campaign_member(campaign_id) AND visibility = 'campaign_public')
  );
CREATE POLICY npcs_all_gm ON npcs FOR ALL
  USING (is_campaign_gm(campaign_id));

-- Journal Entries
CREATE POLICY journal_select ON journal_entries FOR SELECT
  USING (
    is_campaign_gm(campaign_id) OR
    (is_campaign_member(campaign_id) AND visibility = 'campaign_public') OR
    (author_id = auth.uid() AND visibility = 'character_private')
  );
CREATE POLICY journal_insert ON journal_entries FOR INSERT
  WITH CHECK (is_campaign_member(campaign_id));
CREATE POLICY journal_update ON journal_entries FOR UPDATE
  USING (author_id = auth.uid() OR is_campaign_gm(campaign_id));
CREATE POLICY journal_delete ON journal_entries FOR DELETE
  USING (author_id = auth.uid() OR is_campaign_gm(campaign_id));

-- Transactions
CREATE POLICY transactions_select ON transactions FOR SELECT
  USING (is_campaign_member(campaign_id));
CREATE POLICY transactions_insert ON transactions FOR INSERT
  WITH CHECK (is_campaign_member(campaign_id));
