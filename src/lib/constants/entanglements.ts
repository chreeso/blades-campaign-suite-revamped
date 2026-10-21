export interface EntanglementInfo {
  name: string;
  description: string;
  mechanicalEffect: string;
}

export const ENTANGLEMENTS_TABLE: Record<
  'low' | 'medium' | 'high',
  Record<'1-3' | '4-5' | '6', EntanglementInfo>
> = {
  // Wanted Level 0 - 1
  low: {
    '1-3': {
      name: 'Gang Trouble / The Usual Suspects',
      description: 'One of your cohorts causes trouble with another faction due to their flaw, or the Bluecoats round up suspects in your district.',
      mechanicalEffect: 'Lose 1 Rep or pay 1 Coin to smooth it over, or a cohort suffers Level 2 harm.'
    },
    '4-5': {
      name: 'Rivals',
      description: 'A neutral faction or rival crew moves against your claims, assets, or vice purveyors.',
      mechanicalEffect: 'Lose 1 Hold until you deal with them, or pay 1 Coin / 2 Rep to appease them.'
    },
    '6': {
      name: 'Unquiet Dead / Cooperation',
      description: 'A rogue spirit is drawn to your crew’s violent electroplasmic wake, or a friendly faction asks for an unpaid favor.',
      mechanicalEffect: 'Perform an exorcism / warding, or lose 1 Status with the faction if refused.'
    }
  },

  // Wanted Level 2 - 3
  medium: {
    '1-3': {
      name: 'Demands',
      description: 'A higher-tier faction or corrupt magistrate demands tribute or a slice of your score profits.',
      mechanicalEffect: 'Pay 1 or 2 Coin (or 2 Rep) to the faction, or take -1 Status immediately.'
    },
    '4-5': {
      name: 'Show of Force / Questioning',
      description: 'The Bluecoats raid your hunting grounds or shake down your associates for leads on your recent operations.',
      mechanicalEffect: 'One PC must volunteer to be questioned (roll Resolve or pay 1 Coin bribe), or hunting grounds take -1 effect next score.'
    },
    '6': {
      name: 'Reprisals',
      description: 'An enemy faction executes a retaliatory strike against your assets or cohorts.',
      mechanicalEffect: 'A cohort is broken or destroyed, or an asset is seized until recovered in a project.'
    }
  },

  // Wanted Level 4
  high: {
    '1-3': {
      name: 'Vendetta / Flipped',
      description: 'An allied contact is coerced into betraying you, or an enemy faction declares blood vendetta.',
      mechanicalEffect: 'The crew takes -1 Hold and suffers immediate War conditions (-1 free downtime action).'
    },
    '4-5': {
      name: 'Interrogation',
      description: 'Bluecoats arrest a PC or key contact and subject them to brutal interrogation in Ironhook Prison.',
      mechanicalEffect: 'Resist with Resolve (suffering stress) or snitch, or pay 3 Coin in legal bribes to arrange early bail.'
    },
    '6': {
      name: 'Arrest Warrant',
      description: 'An Inspector signs an ironclad arrest warrant for the crew. A scoundrel or cohort must take the fall.',
      mechanicalEffect: 'Send someone to Ironhook Prison (incarceration clock starts), or crew Wanted Level increases by 1.'
    }
  }
};
