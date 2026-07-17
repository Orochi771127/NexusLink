# Companion Integration Patterns

> **Status:** Non-canonical design reference  
> **Goal:** Prevent ordinary utilities from being disguised as companion features.

## 1. Shared Ritual

The user and companion perform a brief action together. The value is pacing, presence, and meaning rather than task completion.

**Suitable for:** breathing, emotional check-in, focus start, sleep wind-down, return reflection.

**Required properties:** optional, bounded, skippable, non-judgmental, no streak pressure.

## 2. Environmental Translation

A real-world signal changes habitat atmosphere rather than appearing as a dashboard.

**Suitable for:** weather, season, time of day, manually selected city, limited activity context.

**Example:** rain changes sound, light, posture, and a short shared line. It does not create a weather app inside the habitat.

## 3. Memory Artifact

User-selected information becomes a private in-world object or trace.

**Suitable for:** journals, photos, reading insights, time capsules, journey memories.

**Required controls:** inspect, edit, delete, export where appropriate, and distinguish user facts from AI interpretation.

## 4. Quiet Co-Presence

The companion remains present while the user performs an external task without managing or policing it.

**Suitable for:** focus sessions, reading, creative work.

**Boundary:** no productivity guilt, repeated reminders, failure language, or claims that the companion was harmed by interruption.

## 5. Contextual Return

A narrowly scoped external event informs the next return moment.

**Suitable for:** a completed walk, selected calendar event, weather shift, finished reading session.

**Boundary:** the response should acknowledge context without pretending complete knowledge or surveillance.

## 6. Companion-Mediated Choice

The companion presents a small number of reflective choices rather than issuing expert recommendations.

**Suitable for:** emotional naming, deciding whether to rest or begin, selecting a ritual.

**Unsuitable for:** diagnosis, investment selection, legal strategy, medication, crisis assessment.

## 7. External Utility Hand-off

The companion identifies a need and hands the user to a specialized tool or separate product surface.

**Suitable for:** calendar editing, file search, email, project management, professional support.

This pattern preserves the game interface and avoids pretending Nexus Link should own every workflow.

## 8. Anti-Patterns

### Mascot Overlay

A standard dashboard with a character speaking labels. This adds visual branding but no companion advantage.

### Emotional Compliance Engine

Using affection, disappointment, scarcity, or guilt to force task completion or return behavior.

### Omniscient Companion

Acting as though the system knows the user's life when it has partial or inferred data.

### Private-Data Vacuum

Collecting messages, files, health data, precise location, or microphone input because it might be useful later.

### Universal Expert

Allowing the companion to speak with unwarranted authority across medicine, finance, law, relationships, and safety-critical decisions.

## 9. Selection Rule

Use the least invasive pattern that produces the desired companion value. Prefer manually initiated and local-first interactions over passive monitoring. Prefer atmosphere and memory over dashboards and alerts.
