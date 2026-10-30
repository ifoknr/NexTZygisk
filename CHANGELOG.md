# NextZygisk changelog

<!-- Each "## vX.Y.Z" section is the release notes and the Telegram post: the Arabic bullets, then a line "**English**" and the same bullets in English. Keep it short (about 760 characters). Commits show IFOKNR only. -->

## v1.0.7
- شكل جديد: أيقونة رمادية هادية مثل باقي أدوات IFOKNR، واسم الأداة بخط جديد فوق، وتوقيع IFOKNR في صفحة الحقوق.

**English**
- New look: a calm grey icon like the other IFOKNR tools, the name in new lettering at the top, and IFOKNR's signature in the credits.

## v1.0.6
- إصلاح: لو فشلت وحدتان في التحميل، كان يتحذف العنصر الخطأ من قائمة ReZygiskd، فوحدة تكلّم companion ومجلد وحدة ثانية. الحين تُحذف بموقعها الصحيح.
- إصلاح: تطبيق ينقتل قبل رد الـ companion كان يطفي الـ companion ومعه الـ threads اللي تخدم باقي التطبيقات. الحين يسكّر اتصاله هو بس ويكمّل.
- إصلاح: عميل معلّق كان يوقف فتح كل التطبيقات لأن الـ daemon يخدم واحد في كل مرة بلا مهلة. أضفنا مهلة ثانيتين، تُشال قبل تسليم الاتصال للـ companion.
- إصلاح: ردود الـ daemon صارت تُفحص للحجم الكامل، مو لـ-1 فقط، فقراءة ناقصة ما تُقبل كاملة.
- إصلاح: خانات فاضية في جدول الرموز كانت تُقرأ في elf_util.c (اكتشفها make analyzer).
- مزامنة مع ReZygisk: المفاتيح تحتفظ بحالتها بعد تغيير التبويب، بناء Termux، تحديث PLTI و CSOLoader، وأمر make analyzer.

**English**
- Fixed: with two modules failing to load, the wrong entry was removed from ReZygiskd's list, so a module talked to another module's companion and directory. It is now removed by its current index.
- Fixed: a client that died before the companion's reply tore down the companion and the threads serving every other app. It now closes just that client and continues.
- Fixed: a stalled client blocked all app launches, since the daemon serves one client at a time with no timeout. Added a 2s timeout, cleared before the socket is handed to a companion.
- Fixed: daemon replies are checked for their full size, not only -1, so a short read is not accepted as complete.
- Fixed: null symtab slots were dereferenced in elf_util.c (found by make analyzer).
- Synced with ReZygisk: switches keep state after a tab change, Termux build, PLTI and CSOLoader bump, and a make analyzer target.

## v1.0.5
- WebUI: the bottom bar is even on tablets. A tablet-only rule spread the four icons so
  far apart that Home and Settings fell outside the bar; each icon now takes an equal share.

## v1.0.4
- Fixed: the paths in NextSUSFS's "Unmounted for apps" list were never unmounted. NextZygisk
  turns KernelSU's own umount off and unmounts root mounts itself, so KernelSU never applied
  that list. NextZygisk now reads /data/adb/nextsusfs/custom_kernel_umount.txt and unmounts
  those paths too, for the same apps it unmounts root for. This hides a ROM's own bind
  mounts over system files (for example a GSI's bluetooth or camera overrides) from apps.

## v1.0.3
- Updates from the root manager: module.prop has an updateJson link, and each release
  updates update.json, so the next versions show up as updates automatically.

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
