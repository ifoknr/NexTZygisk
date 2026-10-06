# NextZygisk changelog

## v1.0.2
- Module banner in the root manager's module list, in the NEXT design shared with NextWheel
  and NextSUSFS. The README header and social preview use the same design.

## v1.0.1
First stable NextZygisk release, based on ReZygisk by The PerformanC Organization.

**NEXT stack**
- Rebranded to NextZygisk; the WebUI shows the root hiding stack (NextWheel, NextSUSFS and
  other hiding modules) with their live status.
- Shows when a hiding module was removed but is still loaded until the next reboot.
- Every Zygisk module is listed with its real state, plus an action.sh status report.

**Fixes**
- 32-bit zygiskd build fixed (file stamps used 32-bit fields for inode and size).
- Invalid state.json, monitor overflow and spin, and several daemon robustness issues fixed.
- WebUI relative times and a duplicate first refresh fixed; architecture pills stay
  left-to-right in RTL languages.

**Improvements**
- Root unmount switch, Zygisk Next conflict handling and daemon hardening.
- Root implementation lookups cached instead of repeated on every app launch.
- Treat Wheel / NextWheel logs included in live logs and diagnostics.

**WebUI**
- Redesigned live dashboard, modules page, tools and log viewer.
- Tablet layout with two columns and quick tools, and a compact floating navbar with Lucide icons.
- Sora and Noto Kufi Arabic fonts, bundled so the WebUI works offline.

**Project**
- New README in English and Arabic with a banner, and GitHub Releases with release and
  debug zips.
