import { CrewPlaybook } from '@/types/blades';

export interface ClaimNode {
  id: string;
  name: string;
  description: string;
  isTurf: boolean;
  isLair?: boolean;
  row: number; // 0 to 2
  col: number; // 0 to 3
}

export const CREW_CLAIMS_MAPS: Record<CrewPlaybook, ClaimNode[]> = {
  Shadows: [
    // Row 0
    { id: 'sh_interrogation', name: 'Interrogation Chamber', description: '+1d to Command and Sway on-site', isTurf: false, row: 0, col: 0 },
    { id: 'sh_turf_1', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 0, col: 1 },
    { id: 'sh_tavern', name: 'Tavern', description: '+1d to Consort and Sway on-site', isTurf: false, row: 0, col: 2 },
    { id: 'sh_lookouts', name: 'Lookouts', description: '+1d to Hunt or Survey on your turf', isTurf: false, row: 0, col: 3 },

    // Row 1
    { id: 'sh_turf_2', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 0 },
    { id: 'sh_lair', name: 'LAIR', description: 'The central sanctuary and headquarters of the crew', isTurf: false, isLair: true, row: 1, col: 1 },
    { id: 'sh_turf_3', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 2 },
    { id: 'sh_informants', name: 'Informants', description: '+1d to Gather Information for a score', isTurf: false, row: 1, col: 3 },

    // Row 2
    { id: 'sh_covert_drop', name: 'Covert Drop', description: '+2 Coin in payoff for espionage/sabotage', isTurf: false, row: 2, col: 0 },
    { id: 'sh_turf_4', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 2, col: 1 },
    { id: 'sh_secret_pathways', name: 'Secret Pathways', description: '+1d to engagement roll for stealth plans', isTurf: false, row: 2, col: 2 },
    { id: 'sh_infirmary', name: 'Infirmary', description: '+1d to healing treatment rolls', isTurf: false, row: 2, col: 3 }
  ],

  Assassins: [
    // Row 0
    { id: 'as_training', name: 'Training Rooms', description: 'Your cohorts get +1 scale in combat', isTurf: false, row: 0, col: 0 },
    { id: 'as_turf_1', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 0, col: 1 },
    { id: 'as_vice_den', name: 'Vice Den', description: 'Roll Tier in downtime for Coin minus Heat', isTurf: false, row: 0, col: 2 },
    { id: 'as_lookouts', name: 'Lookouts', description: '+1d to Hunt or Survey on your turf', isTurf: false, row: 0, col: 3 },

    // Row 1
    { id: 'as_turf_2', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 0 },
    { id: 'as_lair', name: 'LAIR', description: 'The hidden assassin guild sanctuary', isTurf: false, isLair: true, row: 1, col: 1 },
    { id: 'as_turf_3', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 2 },
    { id: 'as_informants', name: 'Informants', description: '+1d to gather information on marks', isTurf: false, row: 1, col: 3 },

    // Row 2
    { id: 'as_victim_trophies', name: 'Victim Trophies', description: '+1 Rep per score due to deadly notoriety', isTurf: false, row: 2, col: 0 },
    { id: 'as_turf_4', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 2, col: 1 },
    { id: 'as_covert_drop', name: 'Covert Drop', description: '+2 Coin in payoff for lethal contracts', isTurf: false, row: 2, col: 2 },
    { id: 'as_infirmary', name: 'Infirmary', description: '+1d to healing treatment rolls', isTurf: false, row: 2, col: 3 }
  ],

  Bravos: [
    // Row 0
    { id: 'br_barracks', name: 'Barracks', description: '+1 scale to thug cohorts', isTurf: false, row: 0, col: 0 },
    { id: 'br_turf_1', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 0, col: 1 },
    { id: 'br_protection', name: 'Protection Racket', description: 'Roll Tier in downtime for Coin minus Heat', isTurf: false, row: 0, col: 2 },
    { id: 'br_street_fence', name: 'Street Fence', description: '+2 Coin in payoff for robbery scores', isTurf: false, row: 0, col: 3 },

    // Row 1
    { id: 'br_turf_2', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 0 },
    { id: 'br_lair', name: 'LAIR', description: 'The fortified gang hall / gym', isTurf: false, isLair: true, row: 1, col: 1 },
    { id: 'br_turf_3', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 2 },
    { id: 'br_tavern', name: 'Tavern', description: '+1d to Consort and Sway on-site', isTurf: false, row: 1, col: 3 },

    // Row 2
    { id: 'br_fight_pit', name: 'Fighting Pit', description: '+1 Rep per score involving physical violence', isTurf: false, row: 2, col: 0 },
    { id: 'br_turf_4', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 2, col: 1 },
    { id: 'br_armory', name: 'Armory', description: '+1d to engagement roll for assault plans', isTurf: false, row: 2, col: 2 },
    { id: 'br_infirmary', name: 'Infirmary', description: '+1d to healing treatment rolls', isTurf: false, row: 2, col: 3 }
  ],

  Cult: [
    // Row 0
    { id: 'cu_sanctuary', name: 'Arcane Sanctuary', description: '+1d to Attune rolls on-site', isTurf: false, row: 0, col: 0 },
    { id: 'cu_turf_1', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 0, col: 1 },
    { id: 'cu_altar', name: 'Ancient Obelisk / Altar', description: '-1 stress cost for performing rituals', isTurf: false, row: 0, col: 2 },
    { id: 'cu_zealots', name: 'Zealot Hall', description: '+1 scale to adept cohorts', isTurf: false, row: 0, col: 3 },

    // Row 1
    { id: 'cu_turf_2', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 0 },
    { id: 'cu_lair', name: 'LAIR', description: 'Subterranean temple to the Forgotten God', isTurf: false, isLair: true, row: 1, col: 1 },
    { id: 'cu_turf_3', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 2 },
    { id: 'cu_crypt', name: 'Catacombs', description: 'Safe burial ground immune to Spirit Wardens', isTurf: false, row: 1, col: 3 },

    // Row 2
    { id: 'cu_relic_vault', name: 'Relic Vault', description: '+2 Coin in payoff for occult artifact scores', isTurf: false, row: 2, col: 0 },
    { id: 'cu_turf_4', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 2, col: 1 },
    { id: 'cu_offering_box', name: 'Offering Box', description: 'Roll Tier in downtime for Coin minus Heat', isTurf: false, row: 2, col: 2 },
    { id: 'cu_infirmary', name: 'Infirmary', description: '+1d to healing treatment rolls', isTurf: false, row: 2, col: 3 }
  ],

  Hawkers: [
    // Row 0
    { id: 'hw_distillery', name: 'Distillery / Lab', description: '+1 tier quality to produced vice concoctions', isTurf: false, row: 0, col: 0 },
    { id: 'hw_turf_1', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 0, col: 1 },
    { id: 'hw_vice_den', name: 'Vice Den', description: 'Roll Tier in downtime for Coin minus Heat', isTurf: false, row: 0, col: 2 },
    { id: 'hw_luxury_venue', name: 'Luxury Venue', description: '+1d to Consort and Sway on-site', isTurf: false, row: 0, col: 3 },

    // Row 1
    { id: 'hw_turf_2', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 0 },
    { id: 'hw_lair', name: 'LAIR', description: 'Hidden distribution hub & salon', isTurf: false, isLair: true, row: 1, col: 1 },
    { id: 'hw_turf_3', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 2 },
    { id: 'hw_lookouts', name: 'Lookouts', description: '+1d to Hunt or Survey on your sales turf', isTurf: false, row: 1, col: 3 },

    // Row 2
    { id: 'hw_surplus_cache', name: 'Surplus Cache', description: '+2 Coin in payoff for large vice sales', isTurf: false, row: 2, col: 0 },
    { id: 'hw_turf_4', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 2, col: 1 },
    { id: 'hw_security', name: 'Bouncers / Security', description: '+1 scale to protective cohorts', isTurf: false, row: 2, col: 2 },
    { id: 'hw_infirmary', name: 'Infirmary', description: '+1d to healing treatment rolls', isTurf: false, row: 2, col: 3 }
  ],

  Smugglers: [
    // Row 0
    { id: 'sm_warehouse', name: 'Warehouse', description: 'Store excess cargo and contraband safely', isTurf: false, row: 0, col: 0 },
    { id: 'sm_turf_1', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 0, col: 1 },
    { id: 'sm_secret_routes', name: 'Secret Routes', description: '+1d to engagement roll for transport scores', isTurf: false, row: 0, col: 2 },
    { id: 'sm_dock_rights', name: 'Dock Rights', description: '+2 Coin in payoff for waterborne scores', isTurf: false, row: 0, col: 3 },

    // Row 1
    { id: 'sm_turf_2', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 0 },
    { id: 'sm_lair', name: 'LAIR', description: 'Hidden dry-dock or canal basin', isTurf: false, isLair: true, row: 1, col: 1 },
    { id: 'sm_turf_3', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 1, col: 2 },
    { id: 'sm_canal_lookouts', name: 'Canal Lookouts', description: '+1d to Survey or Hunt along waterways', isTurf: false, row: 1, col: 3 },

    // Row 2
    { id: 'sm_safe_house', name: 'Safe House', description: 'Secondary hideout for heat reduction', isTurf: false, row: 2, col: 0 },
    { id: 'sm_turf_4', name: 'Turf', description: 'Reduces Rep needed to advance Tier by 1', isTurf: true, row: 2, col: 1 },
    { id: 'sm_vehicle_workshop', name: 'Vehicle Workshop', description: '+1 tier quality to crew transport vehicles', isTurf: false, row: 2, col: 2 },
    { id: 'sm_infirmary', name: 'Infirmary', description: '+1d to healing treatment rolls', isTurf: false, row: 2, col: 3 }
  ]
};
