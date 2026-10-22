-- Epic 5.3: Street-Level Procedural Generator — persistent map pins / landmarks
-- Every pin is campaign-scoped; GM-only pins are hidden from players by RLS.

CREATE TABLE IF NOT EXISTS map_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  district_id TEXT,
  x NUMERIC NOT NULL CHECK (x >= 0 AND x <= 600),
  y NUMERIC NOT NULL CHECK (y >= 0 AND y <= 560),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'landmark'
    CHECK (category IN ('landmark', 'hideout', 'hazard', 'shop', 'rumor')),
  notes TEXT NOT NULL DEFAULT '',
  visibility content_visibility NOT NULL DEFAULT 'campaign_public',
  street JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS map_pins_campaign_idx ON map_pins (campaign_id);

ALTER TABLE map_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY map_pins_select ON map_pins FOR SELECT
  USING (
    is_campaign_gm(campaign_id) OR
    (is_campaign_member(campaign_id) AND visibility = 'campaign_public') OR
    (created_by = auth.uid() AND visibility = 'character_private')
  );

-- Members may drop pins, but only GMs may create GM-only pins.
CREATE POLICY map_pins_insert ON map_pins FOR INSERT
  WITH CHECK (
    is_campaign_member(campaign_id) AND created_by = auth.uid() AND
    (visibility <> 'gm_only' OR is_campaign_gm(campaign_id))
  );

CREATE POLICY map_pins_update ON map_pins FOR UPDATE
  USING (is_campaign_gm(campaign_id) OR created_by = auth.uid())
  WITH CHECK (visibility <> 'gm_only' OR is_campaign_gm(campaign_id));

CREATE POLICY map_pins_delete ON map_pins FOR DELETE
  USING (is_campaign_gm(campaign_id) OR created_by = auth.uid());
