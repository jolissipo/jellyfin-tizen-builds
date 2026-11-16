# Jellyfin OSA AVPlayFix

A customized **Jellyfin client for Samsung Tizen TVs**, based on the OSA variant with Samsung **AVPlay** video playback and Smart Hub integration. This project preserves HDR/HDR10+ playback while fixing incorrect video aspect ratios and subtitle handling.

## Fixes and features

- **Correct aspect ratio:** Enables `PLAYER_DISPLAY_MODE_LETTER_BOX` to preserve the original video proportions, including black bars on widescreen 4K content.
- **Subtitle selection menu:** Restores compatibility between the OSA player and the Jellyfin Web subtitle menu.
- **Embedded subtitle selection:** Maps Jellyfin subtitle stream indices to AVPlay's native track indices and restores subtitles when switching tracks.
- **External subtitles:** Renders subtitle events supplied by the Jellyfin server in an HTML overlay, without replacing AVPlay as the video player.
- **Subtitle appearance:** Uses Jellyfin's subtitle preferences for the external subtitle overlay, including text size, font family and weight, color, shadow, background, and vertical positioning.

The client retains the OSA variant's AVPlay integration, horizontal app icon, and Smart Hub support. HDR/HDR10+ activation also depends on the media and the TV's capabilities.

## Downloads

Download the desired `.wgt` package from [Releases](../../releases).

| Package | Jellyfin Web base | Tested on a Samsung TV |
| --- | --- | --- |
| `Jellyfin-OSA-AVPlayFix.wgt` | Latest stable release (12.4 at the time of writing) | **Yes** |
| `Jellyfin-12.z-OSA-AVPlayFix.wgt` | `release-12.z` maintenance branch | **Yes** |
| `Jellyfin-10.11.z-OSA-AVPlayFix.wgt` | `release-10.11.z` maintenance branch | **Not yet confirmed** |

All three packages use the same Tizen application ID. Install only one variant at a time.

## Installation

1. Download your preferred `.wgt` package from [Releases](../../releases).
2. Import it through the custom package installation option in **Apps2Samsung**.
3. Re-sign the package for your TV and install it.

The published packages use a temporary build certificate and must be signed with a certificate compatible with your device.

## Updating and building

Two workflows are available under [Actions](../../actions):

- **Build Jellyfin OSA AVPlayFix:** Resolves the latest Jellyfin Web versions, pins their exact commit SHAs, builds all three packages, and publishes a GitHub Release **only if all three builds succeed**.
- **Get Latest Versions:** Refreshes `versions.json` and `matrix.json` when upstream tags or branch commits change. It does not build packages.

The build workflow resolves upstream versions independently, so running **Get Latest Versions** beforehand is optional.

## Compatibility notes

- **Tested hardware:** Samsung **UE50RU7105KXXC**, running **Tizen 5.0**.
- **Verified builds:** the stable and 12.z versions were tested successfully on this TV, including HDR/HDR10+ playback, correct letterboxing, and external subtitles.
- **Declared minimum OS version:** **Tizen 2.3**, as specified by `required_version="2.3"` in the OSA Tizen application's `config.xml`. This is a package-level requirement, **not** confirmation that AVPlayFix has been tested on every Tizen version from 2.3 onwards.
- The **10.11.z** version has not yet been verified on a physical TV.
- Subtitle appearance settings apply to the **external subtitle overlay**. Embedded subtitles rendered directly by AVPlay may still follow Samsung's native subtitle styling.
- Advanced ASS/SSA styling is not necessarily reproduced in full by the text overlay.

## Source and licensing

The letterbox fix implements the AVPlay display-mode change proposed by [@buddhaCode in issue #113](https://github.com/jeppevinkel/jellyfin-tizen-builds/issues/113): calling `PLAYER_DISPLAY_MODE_LETTER_BOX` before setting the display rectangle.

The customized AVPlay player is in [`patches/osa/avplayVideoPlayer.js`](patches/osa/avplayVideoPlayer.js). The aspect-ratio patch is applied by [`scripts/apply-letterbox.py`](scripts/apply-letterbox.py).

This project uses Jellyfin Web and Jellyfin Tizen/OSA components. Their applicable licenses remain in effect; see the repository's [Mozilla Public License 2.0](LICENSE).
