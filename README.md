# Jellyfin OSA AVPlayFix for Samsung Tizen

Fork-based builds using the experimental AVPlay + Smart Hub player from [jeppevinkel/jellyfin-tizen](https://github.com/jeppevinkel/jellyfin-tizen).

## Download

The [Releases](../../releases) page contains exactly three WGT files per successful build.

| File | Jellyfin Web code |
| --- | --- |
| `Jellyfin-OSA-AVPlayFix.wgt` | Latest stable published release |
| `Jellyfin-12.z-OSA-AVPlayFix.wgt` | Latest commit of release-12.z |
| `Jellyfin-10.11.z-OSA-AVPlayFix.wgt` | Latest commit of release-10.11.z |

All three packages use the same Tizen app ID; install one at a time.
To install, re-sign the WGT using Apps2Samsung.

## Included fixes

- Native AVPlay LETTER_BOX mode preserves original cinema aspect ratio.
- Corrects player compatibility with Jellyfin Web subtitle menu.
- Corrects Jellyfin embedded subtitle stream index mapping.
- Adds an external text subtitle overlay without changing native HDR/HDR10+ video playback.
- Reads Jellyfin local subtitle appearance preferences (size, weight, font, color, shadow, vertical position).

The stable edition has been tested on a Samsung TV. The other two bases have
not yet been validated on a physical TV, even if a build succeeds.

## Workflows

**Build Jellyfin OSA AVPlayFix**: manual Actions workflow. Each execution
fetches the latest upstream versions, pins exact commits for reproducibility,
builds all three packages and publishes a GitHub Release only when all three succeed.

**Get Latest Versions**: manual Actions workflow. Updates `versions.json` and
`matrix.json` if upstream commits change; leaves Git history untouched otherwise.

It is not necessary to run Get Latest Versions before a build: the build
always resolves the latest versions again at runtime.

The build uses a disposable Tizen author certificate. Re-sign the WGT
for your device with Apps2Samsung.

## Attribution

Based on [jeppevinkel/jellyfin-tizen-builds](https://github.com/jeppevinkel/jellyfin-tizen-builds).
Upstream implementation: [jellyfin/jellyfin-web](https://github.com/jellyfin/jellyfin-web)
and [jellyfin/jellyfin-tizen](https://github.com/jellyfin/jellyfin-tizen).
See [LICENSE](LICENSE).
