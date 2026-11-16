#!/usr/bin/env python3
"""Resolve latest Jellyfin Web stable/maintenance versions into three pinned builds."""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO = "jellyfin/jellyfin-web"
OSA_SHA = "a798c36118117aa8d6eb6f11da35d040907c8840"

def get(path):
    headers = {"Accept": "application/vnd.github+json",
               "User-Agent": "jellyfin-osa-avplayfix",
               "X-GitHub-Api-Version": "2022-11-28"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    request = urllib.request.Request("https://api.github.com" + path, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)

def commit_sha(ref):
    sha = get("/repos/" + REPO + "/commits/" + ref)["sha"]
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise RuntimeError("Invalid upstream commit SHA: " + ref)
    return sha

def write_if_changed(name, data):
    payload = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    path = Path(name)
    if not path.exists() or path.read_text(encoding="utf-8") != payload:
        path.write_text(payload, encoding="utf-8")
        print("Updated " + name)
    else:
        print("Unchanged " + name)

def main():
    tag = get("/repos/" + REPO + "/releases/latest")["tag_name"]
    if not re.fullmatch(r"v[0-9]+(?:\.[0-9]+)+", tag):
        raise RuntimeError("Unexpected stable tag: " + tag)
    versions = {
        "web_repository": REPO,
        "stable": {"ref": tag, "sha": commit_sha(tag)},
        "branches": {
            "12.z": {"ref": "release-12.z", "sha": commit_sha("release-12.z")},
            "10.11.z": {"ref": "release-10.11.z", "sha": commit_sha("release-10.11.z")}
        },
        "osa_tizen": {
            "repository": "jeppevinkel/jellyfin-tizen",
            "ref": "feature/combine-avplay-smart-hub",
            "sha": OSA_SHA
        }
    }
    entries = [
        ("Jellyfin-OSA-AVPlayFix", versions["stable"]["sha"], "stable", True),
        ("Jellyfin-12.z-OSA-AVPlayFix", versions["branches"]["12.z"]["sha"], "12.z", True),
        ("Jellyfin-10.11.z-OSA-AVPlayFix", versions["branches"]["10.11.z"]["sha"], "10.11.z", False)
    ]
    matrix = {"include": [
        {"artifact_name": name, "repository": REPO, "tag": sha,
         "source": source, "node24": node24, "avplay": True, "oblong_icon": True}
        for name, sha, source, node24 in entries
    ]}
    write_if_changed("versions.json", versions)
    write_if_changed("matrix.json", matrix)
    print("Stable " + tag)
    for name, sha, _, _ in entries:
        print(name + ": " + sha)

if __name__ == "__main__":
    try:
        main()
    except (KeyError, ValueError, RuntimeError, urllib.error.URLError, OSError) as exc:
        print("Failed to resolve latest versions: " + str(exc), file=sys.stderr)
        sys.exit(1)
