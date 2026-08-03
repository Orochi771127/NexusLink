# Emotion & Boundary State Machine (FSM / Behavior Tree) Skill

This skill defines Finite State Machine and Behavior Tree patterns for RaphaelCore JS in Nexus Link.

## Core State Machine Structure
```javascript
export class CompanionEmotionFSM {
  constructor(initialState = 'CALM') {
    this.state = initialState;
    this.transitions = {
      CALM: { SOUL_TALK_POSITIVE: 'WARM', OVERTOUCH: 'GUARDED' },
      WARM: { OVERTOUCH: 'HESITATE', RETURN_LONG_ABSENCE: 'LONGING' },
      GUARDED: { REPAIR_STANDOFF: 'CALM', SOUL_TALK_SAFETY_VIOLATION: 'REJECT' },
      HESITATE: { SOUL_TALK_POSITIVE: 'WARM', OVERTOUCH: 'GUARDED' },
      REJECT: { REPAIR_STANDOFF: 'GUARDED' }
    };
  }

  transition(event) {
    const nextState = this.transitions[this.state]?.[event];
    if (nextState) {
      this.state = nextState;
      return true;
    }
    return false;
  }
}
```
