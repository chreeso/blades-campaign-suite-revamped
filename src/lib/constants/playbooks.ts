import { ScoundrelPlaybook, CrewPlaybook, ActionName } from '@/types/blades';

export interface PlaybookTemplate {
  name: ScoundrelPlaybook;
  tagline: string;
  xpTrigger: string;
  defaultActions: Partial<Record<ActionName, number>>;
  specialAbilities: { name: string; description: string }[];
  uniqueInventory: { name: string; load: number; description?: string }[];
}

export const SCOUNDREL_PLAYBOOKS: Record<ScoundrelPlaybook, PlaybookTemplate> = {
  Cutter: {
    name: 'Cutter',
    tagline: 'A dangerous and intimidating fighter',
    xpTrigger: 'Address a challenge with violence or coercion.',
    defaultActions: { skirmish: 1, command: 1 },
    specialAbilities: [
      { name: 'Battleborn', description: 'May push yourself to take +1d or +1 effect when fighting multiple opponents or superior scale.' },
      { name: 'Bodyguard', description: 'When you protect a teammate, take +1d to your resistance roll. When you gather info on threats, take +1d.' },
      { name: 'Ghost Fighter', description: 'Can strike spirits and astral entities with hand-to-hand combat and physical weapons.' },
      { name: 'Leader', description: 'When leading a group action in combat, take 1 less stress if teammates roll 1-3.' },
      { name: 'Mule', description: 'Your load limits increase: Light = 5, Normal = 7, Heavy = 8.' },
      { name: 'Not to be Trifled With', description: 'Push yourself to battle a large gang on equal footing or perform superhuman physical feats.' },
      { name: 'Savage', description: 'When unleashing violent actions, cause +1 level of harm or terrifying effect.' },
      { name: 'Vigorous', description: 'Recover from harm faster; your healing project clocks advance with +1 tick.' }
    ],
    uniqueInventory: [
      { name: 'Fine hand weapon', load: 1, description: 'A masterfully balanced blade or truncheon' },
      { name: 'Fine heavy weapon', load: 2, description: 'A greatsword, heavy axe, or reinforced warhammer' },
      { name: 'Scary weapon or armor', load: 2, description: 'Menacing spikes, barbed chain, or spiked carapace' },
      { name: 'Manacles & key', load: 0, description: 'Heavy steel cuffs' },
      { name: 'Rage essence vial', load: 0, description: 'Alchemical stimulant granting savage fury' }
    ]
  },
  Hound: {
    name: 'Hound',
    tagline: 'A deadly sharpshooter and tracker',
    xpTrigger: 'Address a challenge with tracking or violence.',
    defaultActions: { hunt: 1, survey: 1 },
    specialAbilities: [
      { name: 'Sharpshooter', description: 'Push yourself to shoot beyond standard range or hit impossible targets without penalty.' },
      { name: 'Focused', description: 'Resist consequences of distraction, illusion, or confusion with +1d.' },
      { name: 'Ghost Hunter', description: 'Your hunting hound is attuned to spirits and can track ethereal signatures.' },
      { name: 'Scout', description: 'When gathering info on enemy positions or patrol routes, take +1d and +1 effect.' },
      { name: 'Survivor', description: 'Suffer 1 less stress when rolling resistance using Resolve.' },
      { name: 'Tough as Nails', description: 'Penalties from Level 1 and Level 2 harm do not apply to you.' },
      { name: 'Trained Hunting Pet', description: 'A loyal animal cohort with fearsome predatory edge.' },
      { name: 'Vengeful', description: 'When taking harm from an enemy, mark +1 xp in an attribute track.' }
    ],
    uniqueInventory: [
      { name: 'Fine pair of pistols', load: 1, description: 'Accurate rifled dual flintlocks' },
      { name: 'Fine long rifle', load: 2, description: 'High-precision long-distance carbine' },
      { name: 'Electroplasmic ammunition', load: 1, description: 'Rounds charged to harm ghosts and demons' },
      { name: 'Camouflage cloak', load: 1, description: 'Blends into city shadows or fog' },
      { name: 'Hunting hound', load: 0, description: 'Trained faithful hound' }
    ]
  },
  Leech: {
    name: 'Leech',
    tagline: 'A rogue alchemist and mechanist',
    xpTrigger: 'Address a challenge with technical skill or mayhem.',
    defaultActions: { tinker: 1, wreck: 1 },
    specialAbilities: [
      { name: 'Alchemist', description: 'Invent, craft, and modify concoctions, poisons, and oils with 1 fewer downtime roll.' },
      { name: 'Analyst', description: 'When gathering info via Study or Tinker, take +1d and +1 effect.' },
      { name: 'Artificer', description: 'Craft mechanical apparatuses, clockwork, and traps with +1 tier quality.' },
      { name: 'Fortitude', description: 'Suffer 1 less stress when rolling resistance against poison, disease, or chemicals.' },
      { name: 'Ghost Ward', description: 'Disperse spirits and disrupt spectral barriers using electroplasmic charges.' },
      { name: 'Physicker', description: 'Treat wounds and heal companions without penalty (unlocks the Doctor role).' },
      { name: 'Saboteur', description: 'When wrecking structural targets or setting demolition charges, effect is Great.' },
      { name: 'Venomous', description: 'Immune to 1 chosen poison or chemical concoction.' }
    ],
    uniqueInventory: [
      { name: 'Fine tinker tools', load: 1, description: 'Delicate watchmaker picks and clockwork pliers' },
      { name: 'Fine wrecking kit', load: 2, description: 'High-grade crowbars, wedges, and acids' },
      { name: 'Blowpipe & sleep darts', load: 0, description: 'Concealed bamboo or brass pipe' },
      { name: 'Bandolier of alchemicals', load: 1, description: '3 doses: Drift oil, Trance powder, Quicksilver' }
    ]
  },
  Lurk: {
    name: 'Lurk',
    tagline: 'A daring infiltrator and burglar',
    xpTrigger: 'Address a challenge with stealth or evasion.',
    defaultActions: { prowl: 1, finesse: 1 },
    specialAbilities: [
      { name: 'Infiltrator', description: 'Not affected by quality or tier penalties when bypassing physical security.' },
      { name: 'Daredevil', description: 'When rolling a desperate action, gain +1d to the roll.' },
      { name: 'The Automobile / Ghost Veil', description: 'Can slip into the shadow of the Ghost Field for silent travel.' },
      { name: 'Ambush', description: 'When attacking from unseen stealth, action roll has Great effect.' },
      { name: 'Shadow', description: 'Spend 1 stress to vanish from sight into an existing shadow.' },
      { name: 'Reflexes', description: 'When reacting to sudden ambushes or traps, take +1d to resistance.' },
      { name: 'Tenacious', description: 'Complete recovery or long-term infiltration project clocks with +1 tick.' },
      { name: 'Expertise', description: 'Push yourself to reroll 1 die on any Prowl or Finesse roll.' }
    ],
    uniqueInventory: [
      { name: 'Fine lockpicks', load: 0, description: 'Precision oiled skeleton picks' },
      { name: 'Fine shadow cloak', load: 1, description: 'Light-absorbing dark fabric' },
      { name: 'Light climbing gear', load: 1, description: 'Grapple hook, silk cord, spikes' },
      { name: 'Silence potion', load: 0, description: 'Eliminates footstep acoustics for minutes' },
      { name: 'Dark-sight goggles', load: 1, description: 'Lenses that pierce coal smog and blackout' }
    ]
  },
  Slide: {
    name: 'Slide',
    tagline: 'A subtle manipulator and spy',
    xpTrigger: 'Address a challenge with deception or influence.',
    defaultActions: { sway: 1, consort: 1 },
    specialAbilities: [
      { name: "Rook's Gambit", description: 'Spend 2 stress to roll your best action rating in place of any other action rating.' },
      { name: 'Cloak & Dagger', description: 'When using a disguise or alias, take +1d to avoid discovery.' },
      { name: 'Ghost Voice', description: 'Speak to ghosts and spirits as if living people without penalty.' },
      { name: 'Like Looking in a Mirror', description: 'You always know when someone is lying to you.' },
      { name: 'A Little Something on the Side', description: 'Gain +1 Coin whenever you successfully finish a score.' },
      { name: 'Mesmerism', description: 'When swaying a solitary target, they will believe whatever plausible lie you tell.' },
      { name: 'Subterfuge', description: 'Push yourself to convince an enemy to turn on their allies for a critical turn.' },
      { name: 'Trust in Me', description: 'Allies who assist you gain +1d to their own next action.' }
    ],
    uniqueInventory: [
      { name: 'Fine clothes & disguise kit', load: 1, description: 'Aristocratic garb and cosmetic prosthetics' },
      { name: 'Fine loaded dice & trick cards', load: 0, description: 'Weighted ivory dice and marked decks' },
      { name: 'Trance powder', load: 0, description: 'Subtle powder causing pliable confusion' },
      { name: 'Cane concealing a thin blade', load: 1, description: 'Ornate walking stick hiding razor steel' }
    ]
  },
  Spider: {
    name: 'Spider',
    tagline: 'A devious mastermind and schemer',
    xpTrigger: 'Address a challenge with calculation or conspiracy.',
    defaultActions: { consort: 1, study: 1 },
    specialAbilities: [
      { name: 'Foresight', description: 'Two times per score, take a flashback with a stress cost discount of 1 (minimum 0).' },
      { name: 'Calculating', description: 'Suffer 1 less stress when resisting consequences with Insight.' },
      { name: 'Connected', description: 'When acquiring an asset or gathering info in downtime, take +1d.' },
      { name: 'Functioning Vice', description: 'When indulging your vice, you may also clear 1 stress from an ally.' },
      { name: 'Mastermind', description: 'Lead a group action using Consort or Command even if separated from teammates.' },
      { name: 'Weaving the Web', description: 'Gain +1 Rep whenever a score goes off without an alarm or alert.' },
      { name: 'Jail Bird', description: 'When incarcerated, your Wanted Level does not hinder your faction operations.' },
      { name: 'Ghost Contract', description: 'Binding agreements sealed with electroplasmic marks.' }
    ],
    uniqueInventory: [
      { name: 'Fine blueprints & dossier', load: 1, description: 'Architectural drawings and blackmailed secrets' },
      { name: 'Fine fountain pen & seals', load: 0, description: 'Official municipal inks and stamp crests' },
      { name: 'Pocket watch', load: 0, description: 'Gold-plated chronometer' },
      { name: 'Concealed poison ring', load: 0, description: 'Spring-loaded needle compartment' }
    ]
  },
  Whisper: {
    name: 'Whisper',
    tagline: 'An arcane adept and channeler',
    xpTrigger: 'Address a challenge with arcane power or the supernatural.',
    defaultActions: { attune: 1, study: 1 },
    specialAbilities: [
      { name: 'Compel', description: 'Attune to force a present spirit to obey a direct command.' },
      { name: 'Ghost Mind', description: 'Suffer 1 less stress when resisting supernatural fear or possession.' },
      { name: 'Iron Will', description: 'Immune to the terror of seeing spirits or horrors.' },
      { name: 'Occultist', description: 'Can craft esoteric charms, talismans, and soul jars.' },
      { name: 'Ritual', description: 'Perform occult rituals to manifest supernatural eldritch effects.' },
      { name: 'Strange Methods', description: 'Push yourself to glimpse a future or alternate timeline.' },
      { name: 'Tempest', description: 'Summon electroplasmic lightning, icy gusts, or static discharges.' },
      { name: 'Warded', description: 'Possess an innate ward that absorbs 1 supernatural harm per score.' }
    ],
    uniqueInventory: [
      { name: 'Fine lightning hook', load: 2, description: 'Staff equipped to tether or electrocute spirits' },
      { name: 'Fine spirit mask', load: 1, description: 'Lacquered mask showing ghost field vibrations' },
      { name: 'Ghost key', load: 0, description: 'Antique brass key opening spectral doorways' },
      { name: 'Spirit bottles (2)', load: 1, description: 'Vacuum glass jars to trap captured ghosts' },
      { name: 'Arcane talismans', load: 0, description: 'Inscribed bone wards against evil eyes' }
    ]
  }
};

export const STANDARD_ITEMS: { name: string; load: number; description: string }[] = [
  { name: 'A Blade or Two', load: 1, description: 'Concealable daggers or knives' },
  { name: 'Throwing Knives', load: 1, description: 'A balanced harness of light daggers' },
  { name: 'A Pistol', load: 1, description: 'Heavy sparklock revolver or pistol' },
  { name: 'A Large Weapon', load: 2, description: 'Shotgun, polearm, or greatsword' },
  { name: 'An Unusual Weapon', load: 1, description: 'Whip, blowgun, or garrote' },
  { name: 'Light Armor', load: 2, description: 'Reinforced leather vest and padded tunic' },
  { name: 'Heavy Armor', load: 3, description: 'Steel plate and mail overcoats (+Light = 5 load)' },
  { name: 'Thieves Tools', load: 1, description: 'Picks, wire, miniature crowbar' },
  { name: 'Subterfuge Supplies', load: 1, description: 'Cosmetics, fake badges, wax seals' },
  { name: 'Demolition Tools', load: 2, description: 'Heavy sledge, blast charges, fuses' },
  { name: 'Tinkering Tools', load: 1, description: 'Pliers, files, soldering lamp' },
  { name: 'Lantern & Oil', load: 1, description: 'Brass shuttered lantern with whale oil' },
  { name: 'Burglary Gear', load: 1, description: 'Grappling hook, lightweight rope' },
  { name: 'Spiritbane Charm', load: 0, description: 'Alchemical chime that warns of ghosts' }
];

export const CREW_PLAYBOOKS: Record<CrewPlaybook, { tagline: string; defaultHuntingGrounds: string }> = {
  Assassins: { tagline: 'Killers for hire and contract hunters', defaultHuntingGrounds: 'High-profile assassinations & executions' },
  Bravos: { tagline: 'Mercenaries, thugs, extortionists and street fighters', defaultHuntingGrounds: 'Extortion and armed robbery' },
  Cult: { tagline: 'Devotees of a forgotten deity and arcane seekers', defaultHuntingGrounds: 'Sacred relic heists and ritual sacrifices' },
  Hawkers: { tagline: 'Vice dealers and illegal contraband peddlers', defaultHuntingGrounds: 'Black market narcotics & vice distribution' },
  Shadows: { tagline: 'Burglars, infiltrators, and industrial spies', defaultHuntingGrounds: 'Infiltration, burglary, and espionage' },
  Smugglers: { tagline: 'Contraband couriers across barriers and deathlands', defaultHuntingGrounds: 'Contraband logistics and blockade running' }
};
