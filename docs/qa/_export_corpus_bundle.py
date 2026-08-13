"""Export aiforge-raphael-corpus JSON into NexusLink runtime bundle module."""
import json
from datetime import date
from pathlib import Path

CORPUS_ROOT = Path(__file__).resolve().parents[2].parent / "aiforge-raphael-corpus"
OUT_PATH = Path(__file__).resolve().parents[2] / "src" / "data" / "ai" / "raphaelCorpusBundle.js"
PACKS_ROOT = CORPUS_ROOT / "response_packs"


def load_json(path):
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def normalize_concepts(raw):
    return [
        {
            "id": item.get("id") or item.get("conceptID"),
            "label": item.get("label", ""),
            "definition": item.get("definition", ""),
            "tags": item.get("tags", []),
            "related": item.get("related", [])
        }
        for item in raw
    ]


def normalize_sentences(raw):
    return [
        {
            "id": item.get("id") or item.get("sentenceID"),
            "text": item.get("text", ""),
            "language": item.get("language", "zh"),
            "emotion": item.get("emotion", "calm"),
            "tone": item.get("tone", ""),
            "role": item.get("role", "reference"),
            "concepts": item.get("concepts", [])
        }
        for item in raw
    ]


def normalize_mappings(raw):
    mappings = []
    for item in raw:
        concept_id = item.get("conceptId") or item.get("conceptID")
        sentence_id = item.get("sentenceId") or item.get("sentenceID")
        emotion_hint = item.get("emotionHint", "calm")
        if not sentence_id:
            continue
        existing = next(
            (m for m in mappings if m["conceptId"] == concept_id and m["emotionHint"] == emotion_hint),
            None
        )
        if existing:
            if sentence_id not in existing["sentenceIds"]:
                existing["sentenceIds"].append(sentence_id)
        else:
            mappings.append({
                "conceptId": concept_id,
                "emotionHint": emotion_hint,
                "sentenceIds": [sentence_id],
                "priority": item.get("priority", 1)
            })
    return mappings


def load_companion_packs(companion_dir):
    packs = []
    if not companion_dir.exists():
        return packs

    for path in sorted(companion_dir.glob("*.json")):
        if path.name == "templates.json":
            continue
        data = load_json(path)
        if isinstance(data, list):
            packs.extend(data)
        elif isinstance(data, dict):
            packs.append(data)
    return packs


class CorpusSourceMissing(RuntimeError):
    """The upstream corpus is not where this exporter expects it."""


def load_all_response_packs():
    response_packs = {}
    templates_by_companion = {}

    # Previously this returned empty dicts, and main() then overwrote the bundle
    # with zero companion dialogue while printing a success line. The export is
    # the only source of every companion's Soul Talk lines, so a missing upstream
    # must stop the run rather than silently produce an empty bundle.
    if not PACKS_ROOT.exists():
        raise CorpusSourceMissing(
            f"response pack source not found: {PACKS_ROOT}\n"
            f"  The exporter reads companion dialogue from <corpus>/response_packs/<companion>/*.json.\n"
            f"  Refusing to write {OUT_PATH.name}, because doing so would replace every\n"
            f"  companion's lines with an empty bundle.\n"
            f"  Restore the directory in {CORPUS_ROOT.name}, or point PACKS_ROOT at its new location."
        )

    for companion_dir in sorted(PACKS_ROOT.iterdir()):
        if not companion_dir.is_dir():
            continue
        companion_id = companion_dir.name
        packs = load_companion_packs(companion_dir)
        if packs:
            response_packs[companion_id] = packs

        templates_path = companion_dir / "templates.json"
        if templates_path.exists():
            templates_by_companion[companion_id] = load_json(templates_path)

    return response_packs, templates_by_companion


def main():
    concepts = normalize_concepts(load_json(CORPUS_ROOT / "corpus" / "concepts" / "A_concepts.json"))
    sentences = normalize_sentences(load_json(CORPUS_ROOT / "corpus" / "sentences" / "F_sentences.json"))
    mappings = normalize_mappings(load_json(CORPUS_ROOT / "corpus" / "mappings" / "G_mappings.json"))
    response_packs, templates_by_companion = load_all_response_packs()

    pack_count = sum(len(packs) for packs in response_packs.values())
    template_count = sum(len(doc.get("templates", [])) for doc in templates_by_companion.values())

    # Second guard: the directory can exist and still yield nothing (empty, or a
    # layout change). Writing that out is the same data loss as the missing-root
    # case, so refuse it too rather than trusting the directory check alone.
    if pack_count == 0:
        raise CorpusSourceMissing(
            f"found {PACKS_ROOT} but it yielded 0 companion packs.\n"
            f"  Refusing to overwrite {OUT_PATH.name} with an empty bundle."
        )

    bundle = {
        "version": "1.2.0-multi-companion-packs",
        "source": "aiforge-raphael-corpus",
        "exportedAt": date.today().isoformat(),
        "concepts": concepts,
        "sentences": sentences,
        "mappings": mappings,
        "responsePacks": response_packs,
        "templates": templates_by_companion
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    js = (
        "/** Auto-generated by docs/qa/_export_corpus_bundle.py — do not hand-edit. */\n"
        f"export const RAPHAEL_CORPUS_BUNDLE = Object.freeze({json.dumps(bundle, ensure_ascii=False, indent=2)});\n"
    )
    OUT_PATH.write_text(js, encoding="utf-8")
    print(
        f"Wrote {OUT_PATH} ({len(sentences)} ref sentences, "
        f"{pack_count} companion packs across {len(response_packs)} companions, "
        f"{template_count} templates)"
    )


if __name__ == "__main__":
    main()