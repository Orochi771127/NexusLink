# Ink.js Interactive Narrative & Dialogue Tree Skill

This skill defines narrative branching and dialogue tree integration patterns for Soul Talk and Return Echo in Nexus Link.

## Core Rules
1. Non-linear dialogue choices based on Companion Boundary & Relationship level.
2. Return Echo (無罪惡感回歸台詞) must avoid guilt-tripping the player.
3. Integrate story state with `nexusLinkR2State` persistence.

## Code Pattern: Ink Story Integration
```javascript
import { Story } from 'inkjs';

export function createSoulTalkStory(storyJson, companionState) {
  const story = new Story(storyJson);
  story.variablesState.set("relationship_level", companionState.growthG2Level || 1);
  story.variablesState.set("boundary_status", companionState.boundaryStatus || "CALM");
  return story;
}
```
