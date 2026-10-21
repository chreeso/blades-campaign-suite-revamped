-- ====================================================================
-- Blades in the Dark — NPC Affiliations & Character Relations Migration
-- ====================================================================

-- 1. Helper function for character ownership
CREATE OR REPLACE FUNCTION owns_character(char_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM characters
    WHERE id = char_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Campaign Relationship Labels (System badges are built-in, campaign-exclusive badges here)
CREATE TABLE IF NOT EXISTS campaign_relationship_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'amber',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, name)
);

CREATE INDEX IF NOT EXISTS idx_campaign_relationship_labels ON campaign_relationship_labels(campaign_id);

-- 3. Character to NPC Relations (1-100 score, badges, public & secret/GM notes)
CREATE TABLE IF NOT EXISTS character_npc_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  npc_id UUID NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 50 CHECK (score >= 1 AND score <= 100),
  badges TEXT[] NOT NULL DEFAULT '{}',
  public_notes TEXT,
  private_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(character_id, npc_id)
);

CREATE INDEX IF NOT EXISTS idx_character_npc_relations_char ON character_npc_relations(character_id);
CREATE INDEX IF NOT EXISTS idx_character_npc_relations_npc ON character_npc_relations(npc_id);
CREATE INDEX IF NOT EXISTS idx_character_npc_relations_camp ON character_npc_relations(campaign_id);

-- 4. Enable Row Level Security
ALTER TABLE campaign_relationship_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_npc_relations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: campaign_relationship_labels
CREATE POLICY campaign_relationship_labels_select ON campaign_relationship_labels FOR SELECT
  USING (is_campaign_member(campaign_id));

CREATE POLICY campaign_relationship_labels_insert ON campaign_relationship_labels FOR INSERT
  WITH CHECK (is_campaign_member(campaign_id));

CREATE POLICY campaign_relationship_labels_update ON campaign_relationship_labels FOR UPDATE
  USING (is_campaign_gm(campaign_id) OR is_campaign_member(campaign_id));

CREATE POLICY campaign_relationship_labels_delete ON campaign_relationship_labels FOR DELETE
  USING (is_campaign_gm(campaign_id));

-- 6. RLS Policies: character_npc_relations
CREATE POLICY character_npc_relations_select ON character_npc_relations FOR SELECT
  USING (is_campaign_member(campaign_id));

CREATE POLICY character_npc_relations_insert ON character_npc_relations FOR INSERT
  WITH CHECK (is_campaign_gm(campaign_id) OR (is_campaign_member(campaign_id) AND owns_character(character_id)));

CREATE POLICY character_npc_relations_update ON character_npc_relations FOR UPDATE
  USING (is_campaign_gm(campaign_id) OR owns_character(character_id));

CREATE POLICY character_npc_relations_delete ON character_npc_relations FOR DELETE
  USING (is_campaign_gm(campaign_id) OR owns_character(character_id));

-- 7. Ensure campaign members can insert NPCs during character creation or campaign play
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'npcs' AND policyname = 'npcs_insert_member'
  ) THEN
    CREATE POLICY npcs_insert_member ON npcs FOR INSERT
      WITH CHECK (is_campaign_member(campaign_id));
  END IF;
END $$;

-- 8. Add to Realtime Publication if active
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE campaign_relationship_labels;
    ALTER PUBLICATION supabase_realtime ADD TABLE character_npc_relations;
  END IF;
END $$;
