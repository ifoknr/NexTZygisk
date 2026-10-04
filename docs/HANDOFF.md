# NextZygisk: handoff notes

Read this first when you continue the project from a new session or another account. It records where the project stands, why things are the way they are, and what is left.

> **ملخص بالعربي:** NextZygisk فورك من ReZygisk. كل الشغل مدموج في `main` (PR #1 و PR #2)، والبناء ينجح على GitHub لكل المعماريات. أول تجربة على جهاز حقيقي نجحت: Galaxy Tab S10 Ultra مع KernelSU، والحالة "يعمل" و Treat Wheel نشط. أهم الخطوات الجاية:
> 1. تجربة الإخفاء بالتفصيل وزر Action وأجهزة ثانية.
> 2. نشر أول إصدار من Actions ← Release.
> 3. فورك Treat Wheel في مستودع منفصل وربطه بعقد مشترك.
>
> المعرّف الداخلي بقى `rezygisk` عن قصد، عشان التحديث فوق ReZygisk يشتغل، وعشان Treat Wheel يتعرّف على الإضافة.

## 1. At a glance

| | |
|---|---|
| Repository | [ifoknr/NexTZygisk](https://github.com/ifoknr/NexTZygisk) (default branch `main`) |
| Upstream | [PerformanC/ReZygisk](https://github.com/PerformanC/ReZygisk), forked at `791507a` |
| Owner | [ifoknr](https://github.com/ifoknr) |
| Work branch | `claude/performance-updates-review-i6y5sj` (PRs [#1](https://github.com/ifoknr/NexTZygisk/pull/1) and [#2](https://github.com/ifoknr/NexTZygisk/pull/2), both merged) |
| CI | `ci.yml` (Untrusted CI) builds every ABI, release and debug. Last runs: green. |
| Releases | `release.yml` is ready, but no release has been published yet. |
| Device testing | **First pass OK.** Samsung Galaxy Tab S10 Ultra (SM-X926B), Android 14, KernelSU, build 566 (`56c8a1f`): Working, Zygote64 injected, 3/3 Zygisk modules working, Treat Wheel active. Not yet checked: hiding against real detector apps, the Action button, Magisk and APatch, and 32-bit Zygote devices. |
| Treat Wheel fork | [ifoknr/NextWheel](https://github.com/ifoknr/NextWheel) exists (Treat Wheel v0.0.11). The owner wants the Treat Wheel fork kept in a **separate repository**. |

## 2. Decisions to keep (and why)

1. **Module ID stays `rezygisk`.** Only the visible name changed to NextZygisk (`common.mk`: `MODULE_NAME ?= NextZygisk`). Changing the ID would break three things:
   - updating in place over an existing ReZygisk install;
   - Treat Wheel, whose installer checks `/data/adb/modules/rezygisk` and `versionCode >= 508`, and whose `rz_daemon.c` hard-codes `/data/adb/rezygisk/cp64.sock`;
   - root managers that look for ReZygisk.
2. **Paths stay `/data/adb/rezygisk/...`** (state dir, sockets) for the same reason.
3. **No `updateJson`.** With the same ID, the upstream update.json would have offered ReZygisk builds as "updates" and replaced NextZygisk.
4. **Root unmount stays ON by default.** BreZygisk ships it off and disables KernelSU's kernel umount, so nothing hides root mounts by default. Do not copy that.
5. **The library injected into Zygote keeps `-fno-stack-protector`.** Upstream disabled it on purpose. Hardening flags were added to zygiskd only.
6. **The README keeps the owner's "personal project, use at your own risk" warning.**

## 3. What changed, by area

### Daemon: `zygiskd/`
- **Per-launch caches.** Every app launch blocks Zygote until `GetProcessFlags` answers.
  - `root_impl/magisk.c`: the manager package, root policies (`policy=2`) and denylist are loaded once, then reloaded when `magisk.db`, `-wal` or `-journal` changes (`struct file_stamp`, in `utils.c`). Denylist matching reimplements SQLite `LIKE` (`sqlite_like`). It was verified against real SQLite on 5010 cases. Any load failure falls back to the old direct queries.
  - `root_impl/apatch.c`: `package_config` is parsed once and reused until the file changes.
  - `root_impl/common.c`: `uid_from_pkg` remembers the found path and validates it with one `stat()`.
- `utils.c`:
  - `exec_command_output()` returns the whole stdout, or NULL when the output is too large or the command exits non-zero;
  - `listen(SOMAXCONN)`;
  - `read_string` always NUL-terminates;
  - the listener socket is `SOCK_CLOEXEC`;
  - `is_umount_disabled()`;
  - `save_mns_fd` skips unshare and umount when unmount is disabled.
- `zygiskd.c`:
  - `accept4(CLOEXEC)`, and one bad client no longer stops the daemon;
  - the companion socketpair is `CLOEXEC`;
  - debug builds log `GetProcessFlags ... took N us`.
- `utils.h`: the `LOGI/LOGW/LOGE` macros are `do { } while (0)`.
- `constants.h`: `UMOUNT_DISABLED_FILE` is `/data/adb/nextzygisk/umount_disabled`. It persists across boots and is removed by `uninstall.sh`. It is read once at daemon start, so a change applies after reboot.
- `Makefile`: `$(NDK_CFLAGS)` (stack protector, `_FORTIFY_SOURCE`, sections) and `-Wl,--gc-sections`.

### Loader and monitor: `loader/`
- `ptracer/monitor.c`:
  - `state.json` is valid JSON (no trailing comma, escaped strings), written atomically (tmp file + rename), and always contains `zygote["32"]` for supported ABIs;
  - status text is bounded with `strlcat` (there was a stack overflow);
  - `waitpid` returning -1 no longer spins;
  - the status is refreshed when a daemon exits;
  - user-visible strings say NextZygisk.
- `ptracer/main.c`: `ctl` with no argument and `info` with the daemon down no longer crash.
- `common/daemon.c`: `rezygiskd_get_info` zeroes its output and uses `calloc`.
- `common/misc.c` (runs inside Zygote): no double close or double fclose, the maps leak is fixed, and children are reaped.

### Module scripts: `module/src/`
- `customize.sh`: an install banner (FIGlet "small"), and it disables Zygisk Next (`zygisksu`) and says so.
- `service.sh` and `post-fs-data.sh`: the description prefix no longer grows on every boot, and a missing `.bak` is guarded.
- `action.sh` (new): the Action button prints the monitor, daemons, Zygotes, root-unmount state and every Zygisk module with its status. Values read from state.json are sanitized before `eval`.
- `uninstall.sh`: also removes `/data/adb/nextzygisk`.

### WebUI: `webroot/`
- `js/rz.js` is the shared data layer. Every page uses it.
  - It batches shell calls, escapes all strings, recovers older invalid state.json files, and provides polling (`startPolling`).
  - Its main exports are `getZygiskModules` (status plus reason per module), `detectHidingModules` and `isUmountDisabled`.
- `css/components.css`: the design system, scoped under `.nz` because of the legacy `* { background-color }` rule.
- `js/icons.js` (inline Material Symbols) and `js/themes/accent.js` (8 accents with dark and light tones).
- Pages:
  - `home` (status ring, issue banners, components, hiding, device);
  - `modules` (every Zygisk module, filter, per-ABI library rows);
  - `actions` (monitor, root-unmount switch, daemon query, tools);
  - `actions/minipage/logs` (live logcat with filters);
  - `settings`, plus the `theme` and `language` minipages.
- Wide screens (760px and up, `components.css`):
  - two columns (`.nz_cols`), with Home adding a modules overview and quick tools (`.nz_wide_only`);
  - the hero stats move beside the status from 880px;
  - phones keep the single-column layout.
- `js/tools.js`: the tools shared by Actions and Home. Mini pages belong to their parent page, so Home opens Actions before Live logs.
- The `/TreatWheel/language` storage key comes from upstream's "Treat Wheel Framework" page loader. It is unrelated to the hiding module; leave it.
- `pageLoader.js`:
  - missing translation keys fall back to `en_US` (`deepMerge`), and language files are cached;
  - the first load no longer calls `history.back()`;
  - a minipage close race that could close the WebUI is fixed.
- Translations: everything new exists in `en_US` and `ar_EG`. Other languages fall back to English per key.

### Project
- `README.md` (English) and `READMEs/README_ar-SA.md` (Arabic). Images are in `docs/assets/`: `banner.png`, `screenshots.png`, and `social-preview.png`, which the owner still has to upload under Settings → Social preview.
- `.github/workflows/release.yml`: run it from Actions → Release (pre-release by default) or push a `v*` tag.
- `cla.yml` was removed. It was PerformanC's CLA and needs their bot token.

## 4. Architecture crib

- **Monitor** (`zygisk-ptrace64 monitor`, started from `post-fs-data.sh`):
  - it ptraces init and spots `app_process` execs;
  - it starts `zygiskd64/32` and runs `zygisk-ptraceXX trace <pid>` to inject `libzygisk.so`;
  - it listens on the datagram socket `/data/adb/rezygisk/init_monitor`;
  - it writes `module.prop` (description) and `/data/adb/rezygisk/state.json`.
- **state.json**:
  ```json
  { "root": "KernelSU", "monitor": { "state": "0", "reason": "..." },
    "rezygiskd": { "64": { "state": 1, "reason": "...", "modules": ["id"] }, "32": { ... } },
    "zygote": { "64": 1, "32": 1 } }
  ```
  `monitor.state` is a string: 0 tracing, 1 stopping, 2 stopped, 3 exiting.
- **Daemon**: a stream socket at `/data/adb/rezygisk/cp64.sock` (or `cp32.sock`). The actions are numbered 0–8; `UpdateMountNamespace` is 7. **Treat Wheel copies this protocol by hand**, so never renumber it.
- **Control**: `bin/zygisk-ptrace64 ctl start|stop|exit` and `bin/zygisk-ptrace64 info`.

## 5. How to build and test (cloud sessions)

- **No NDK locally.** `dl.google.com` is blocked by the network policy. Build through CI: dispatch `ci.yml` on the branch, or let a PR trigger it. With the GitHub MCP tools that means `actions_run_trigger` → `run_workflow`, `workflow_id: ci.yml`.
- **Host compile checks for C.** Use host `clang -fsyntax-only` with zygiskd's exact flags (see `zygiskd/Makefile`; `-std=c99 -Wpedantic -Werror -Wconversion ...`) and stub headers for `android/log.h` and `sys/system_properties.h`. Always compare against the unmodified file, because some host-only errors exist upstream.
- **Logic checks.** Small gcc harnesses with ASan and UBSan, built by `#include`-ing the C file with stubbed dependencies. The SQLite LIKE parity cases came from Python's `sqlite3`.
- **WebUI.**
  - Serve it with `cd webroot && python3 -m http.server 8765`. Outside a root manager, `js/development_kit.js` answers shell calls with fake data.
  - `localStorage.rz_dev_state` overrides `state.json` (paste raw JSON), and `rz_dev_umount_off = '1'` simulates unmount being off.
  - Playwright: `require('/opt/node-tools/node_modules/playwright')`. It uses the bundled Chromium; do not run `playwright install`.

## 6. Comparisons already done

- **BreZygisk** ([rrr333nnn333/brezygisk](https://github.com/rrr333nnn333/brezygisk), commit `e7d3ab3`):
  - it supports KernelSU only;
  - its "BreZygisk Umount" is off by default, so root mounts are visible to denylisted apps by default, while the WebUI still says "Working and Hiding";
  - it misses upstream fix #395 (connect returns a closed fd) and every fix listed above.
  - **Ideas adopted, done safely:** disabling Zygisk Next at install, the umount switch (default on), daemon hardening, and `make updateWebUI`.
- **ReSukiSU** ([ReSukiSU/ReSukiSU](https://github.com/ReSukiSU/ReSukiSU)): compatible.
  - Its interface matches: the `sys_reboot` magic numbers and ioctls 8, 9, 10 and 14 are identical.
  - Its versions start at 30700 (we need kernel ≥ 10940 and ksud ≥ 11425), and `ksud` is linked at `/data/adb/ksu/bin/ksud`.
  - It allows several managers, and the kernel reports the *last* one as the manager.

## 7. What's next

1. **More device tests.** The first run on a tablet passed (see the table above). Still to check:
   - hiding, with an app on the denylist and with Treat Wheel;
   - the Action button output;
   - a phone with a 32-bit Zygote, plus Magisk and APatch;
   - the tablet layout (two columns from 760px) on the real tablet.

   On any problem, use WebUI → Actions → Export diagnostics, which saves to `Download/NextZygisk/`.
2. **First release.** Actions → Release → Run workflow. It is a pre-release until the device tests pass.
3. **Social preview.** Upload `docs/assets/social-preview.png` in repository Settings → General → Social preview.
4. **Signed builds (optional).** Add the `ORG_PRIVATE_KEY` and `ORG_PUBLIC_KEY` secrets, base64 encoded. `release.yml` and `trusted_ci.yml` already use them.
5. **Treat Wheel fork, in a separate repository.** The agreed plan:
   - a shared contract header (`nextzygisk_api.h`: protocol, flags, paths, contract version) owned by NextZygisk, synced into the fork, with a CI check that fails when the two differ;
   - a startup handshake (a new daemon action returning the contract version and features);
   - the NextZygisk WebUI reading `/data/adb/treat_wheel/status` (`hiding` / `crashed`) for Treat Wheel's real state;
   - fixing the fork's `updateJson`, which points to upstream Treat Wheel;
   - agreeing on which module unmounts what.

   Treat Wheel logs under the tag `TreatWheel`, which is already included in the log viewer and diagnostics.
6. **Remaining ideas** from the original review, not done:
   - drop `-ffast-math`;
   - `-Wl,--icf=safe`;
   - unlink the monitor socket before `bind`;
   - an upstream-style `prepare_environment` read from `module.prop.bak`.
