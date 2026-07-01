# Packaging Roadmap

## 1. Web canonical runtime

The vanilla JavaScript, PixiJS, browser-localStorage runtime remains the product source of truth. Every feature must first run and be validated here.

## 2. PWA

Evaluate an installable web shell only after offline behavior, asset caching policy, update messaging, and local-save recovery have dedicated acceptance criteria. Do not add service-worker behavior opportunistically during UI work.

## 3. Tauri desktop prototype

Treat Tauri as a future isolated desktop prototype. It must consume the canonical web runtime without silently changing renderer, save ownership, or network policy.

## 4. Steam build pipeline

Define the Steam pipeline only after the desktop prototype has an approved packaging architecture, release QA, legal copy, controller/input plan, save-backup policy, and update strategy.

## 5. Capacitor mobile app

Treat Capacitor as a later mobile packaging lane. It requires separate acceptance for safe areas, keyboard behavior, performance, offline state, storage migration, privacy disclosures, and store policy compliance.

## Current constraint

This roadmap creates no package project and introduces no packaging dependency. Web remains canonical until a separately approved ADR and prototype demonstrate otherwise.
