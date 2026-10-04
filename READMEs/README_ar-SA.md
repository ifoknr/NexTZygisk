<div dir="rtl">

<p align="center">
  <img src="../docs/assets/banner.png" alt="NextZygisk" width="100%">
</p>

<p align="center">
  <a href="../README.md">English</a> · <b>العربية</b>
</p>

# NextZygisk

**NextZygisk** تطبيق مستقل لـ Zygisk: يشغّل وحدات Zygisk (مثل LSPosed و Play Integrity Fix و Shamiko و Treat Wheel) على **KernelSU** و **ReSukiSU** و **Magisk** و **APatch**، ويخفي الروت عن التطبيقات اللي تختارها.

مبني على [ReZygisk](https://github.com/PerformanC/ReZygisk) من The PerformanC Organization، ويركّز على ثلاثة أشياء: **سرعة فتح التطبيقات**، و**الثبات**، و**دقة الإخفاء**، مع لوحة تحكم حديثة تفتحها مباشرة من مدير الروت.

> [!NOTE]
> NextZygisk يحتفظ بمعرّف ReZygisk (`rezygisk`). ينثبّت فوق ReZygisk كتحديث، والوحدات اللي تتطلب ReZygisk (مثل Treat Wheel) تشتغل معه عادي.

## المميزات

### ⚡ فتح أسرع للتطبيقات
كل تطبيق ينفتح ينتظر NextZygisk يجاوب: "هل هو في قائمة الإخفاء؟ هل عنده روت؟". الحين الجواب يجي من الذاكرة:

- **Magisk:** صلاحيات الروت وقائمة الإخفاء تنقرأ مرة وحدة، وما تنقرأ من جديد إلا إذا تغيّرت قاعدة بيانات Magisk. هذا يغني عن تشغيل `magisk --sqlite` لين 3 مرات مع كل تطبيق.
- **APatch:** ملف `package_config` ينقرأ مرة وحدة بدل مرتين لكل تطبيق.
- **التعرّف على مدير الروت:** فحص سريع واحد بدل مسح المجلدات كل مرة.

### 🛡️ ثبات ودقة
أكثر من 12 خطأ تصلّحت في الخدمة والمراقبة والكود اللي ينحقن في Zygote. منها:
- تجاوز ذاكرة في كتابة الحالة.
- حلقة تستهلك المعالج 100%.
- الخدمة توقف بسبب تطبيق واحد.
- ملفات مفتوحة تتسرّب للـ companions.
- احتمال التعرّف على مدير روت غلط.
- إغلاق نفس الملف مرتين داخل Zygote.
- ملف حالة غير صالح بعد أي إيقاف للمراقبة.

### 📱 لوحة تحكم داخل مدير الروت
- **الرئيسية:** الحالة المباشرة (المراقبة، الخدمات، الـ Zygote)، وتنبيهات بالسبب الحقيقي، ووحدات الإخفاء عندك، ومعلومات الجهاز.
- **الوحدات:** **كل** وحدات Zygisk المثبّتة مع معرّفها وحالتها الحقيقية (تعمل، جزئياً، لا تعمل، معطّلة، تحتاج إعادة تشغيل)، و**سبب** إذا وحدة ما تعمل.
- **الإجراءات:** التحكم بالمراقبة، ومفتاح فك تركيب الروت، واستعلام الخدمة، وسجلات مباشرة، وتصدير تشخيص، وإعادة تشغيل سريعة.
- **الإعدادات:** الثيمات (النظام، داكن، AMOLED، فاتح)، و8 ألوان، وتحديث تلقائي، و15 لغة منها العربية كاملة.

### 🔘 زر Action
زر **Action** في مدير الروت يعرض الحالة كاملة كنص، ومعها كل وحدات Zygisk وهل تعمل. مفيد خصوصاً مع Magisk لأنه ما يدعم الواجهة.

## صور الواجهة

<p align="center"><img src="../docs/assets/screenshots.png" alt="NextZygisk WebUI" width="100%"></p>

## التوافق

| نظام الروت | أقل إصدار | ملاحظة |
|---|---|---|
| KernelSU | النواة 10940، ksud 11425 | |
| ReSukiSU / SukiSU | نفس واجهة KernelSU | يتعرّف عليه كـ KernelSU |
| KernelSU Next | مثل KernelSU | |
| Magisk | 26402 | لازم تطفي Zygisk المدمج في Magisk |
| APatch | 10655 | |

- **أندرويد:** 7.1 (SDK 25) أو أحدث.
- **المعماريات:** arm64-v8a، و armeabi-v7a، و x86_64، و x86.
- **غير مدعوم:** وجود نظامين روت مع بعض، أو التثبيت من الريكفري.
- **Zygisk Next:** ينطفي تلقائياً وقت التثبيت، لأن وجود نسختين من Zygisk يسبب تعارض.

## التحميل

| المكان | وش تحمّل |
|---|---|
| **[Releases](https://github.com/ifoknr/NexTZygisk/releases)** | آخر ملف `NextZygisk-…-release.zip`، أول ما تنزل الإصدارات. |
| **[GitHub Actions](https://github.com/ifoknr/NexTZygisk/actions/workflows/ci.yml)** | افتح آخر بناء ناجح، ونزّل `NextZygisk-…-release.zip` من قسم **Artifacts**. لازم تكون مسجّل دخول في GitHub. |

كل بناء فيه نسختين:
- **release:** محسّنة وهادية. هذي اللي تستخدمها.
- **debug:** فيها سجلات تفصيلية. استخدمها بس لجمع السجلات عند البلاغ عن مشكلة.

## التثبيت

1. نزّل ملف **release**.
2. افتح مدير الروت (KernelSU أو ReSukiSU أو Magisk أو APatch)، وروح لـ **الوحدات**، واختر **التثبيت من التخزين** وحدد الملف.
3. اقرأ سجل التثبيت. يبدأ بشعار NextZygisk ولازم يخلص بدون أخطاء.
4. **لمستخدمي Magisk بس:** من **إعدادات** Magisk طفّ **Zygisk**، لأن المدمج يتعارض مع NextZygisk.
5. أعد تشغيل الجهاز.

**للتأكد إنه شغّال:** افتح لوحة التحكم، لازم تقول **يعمل** وكل Zygote **تم الحقن**. ووصف الإضافة في قائمة الوحدات يعرض نفس الشي:

```
[Monitor: ✅, NextZygisk 64-bit: ✅, NextZygisk 32-bit: ✅] Standalone implementation of Zygisk.
```

## فتح لوحة التحكم

| مدير الروت | الطريقة |
|---|---|
| KernelSU / ReSukiSU / KernelSU Next / APatch | الوحدات ← NextZygisk ← **WebUI** (أو اضغط على الكرت) |
| Magisk | اضغط **Action** على الإضافة لتقرير نصي، أو افتح الواجهة بتطبيق مثل [MMRL](https://github.com/MMRLApp/MMRL) أو KsuWebUI Standalone |

## إخفاء الروت

1. أضف التطبيقات اللي ما تبيها تشوف الروت لـ **قائمة الإخفاء** في مدير الروت:
   - KernelSU و ReSukiSU: *App Profile ← Umount modules*.
   - Magisk: *Configure DenyList*.
   - APatch: *exclude*.
2. خلّ **الإجراءات ← فك تركيب الروت** **مفعّل** (هو الافتراضي)، فيفك NextZygisk تركيب الروت عن هذي التطبيقات. لا تطفيه إلا إذا عندك وحدة ثانية تتكفّل بالفك، والرئيسية تنبّهك وهو مطفي.
3. **اختياري:** أضف وحدة إخفاء مثل **Treat Wheel** أو **Shamiko**. قسم **الإخفاء** في الرئيسية يوضح هل كل وحدة فعلاً محمّلة وتحميك.

## حل المشاكل

- **إذا فيه شي ما يشتغل:** افتح **الإجراءات ← تصدير التشخيص**. يحفظ تقرير كامل (الحالة، الجهاز، الوحدات، السجلات) في `Download/NextZygisk/`. أرفقه مع البلاغ.
- **السجلات المباشرة:** **الإجراءات ← السجلات المباشرة** تعرض سجلات NextZygisk و Treat Wheel، مع فلترة حسب المستوى والنص.
- **وحدة مكتوب عليها "لا تعمل":** صفحة الوحدات توضح السبب. غالباً يكون واحد من هذي:
  - ما فيه مكتبة لمعمارية جهازك.
  - فيه تحديث ينتظر إعادة تشغيل.
  - الخدمة ما تشتغل.
- **المراقبة "متوقفة":** **الإجراءات ← تشغيل**، أو أعد تشغيل الجهاز.
- **تحتاج تفاصيل أكثر:** ثبّت نسخة **debug**، كرّر المشكلة، وبعدها صدّر التشخيص.

## البناء من المصدر

**بدون أي تجهيز:** افتح [Actions ← Untrusted CI](https://github.com/ifoknr/NexTZygisk/actions/workflows/ci.yml)، واضغط **Run workflow**، واختر الفرع، ونزّل الملفات من **Artifacts**.

**على جهازك:** تحتاج Android NDK و `make` و `python3`:

```sh
git clone --recursive https://github.com/ifoknr/NexTZygisk
cd NexTZygisk
make release        # أو: make debug، أو make all
# الناتج: build/out/NextZygisk-<version>-release.zip
```

`make updateWebUI` يحدّث الواجهة المثبّتة بس، وهذا مفيد وقت تطوير الواجهة.

## المطوّر

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ifoknr"><img src="https://github.com/ifoknr.png?size=120" width="96" alt="ifoknr"><br><b>ifoknr</b></a><br>
      مطوّر NextZygisk
    </td>
  </tr>
</table>

- للمشاكل والاقتراحات: [افتح Issue](https://github.com/ifoknr/NexTZygisk/issues)، ويفضّل ترفق تقرير التشخيص.

## الشكر

NextZygisk مبني على جهود:
- [**The PerformanC Organization**](https://github.com/PerformanC): مشروع [ReZygisk](https://github.com/PerformanC/ReZygisk)، وهو أساس هذا المشروع.
- [**Nullptr**](https://github.com/Dr-TSNG) و [**5ec1cff**](https://github.com/5ec1cff): مطوّري Zygisk Next الأصلي.
- [**ThePedroo**](https://github.com/ThePedroo) و [**RainyXeon**](https://github.com/RainyXeon): مطوّري الواجهة الأصلية.
- [**topjohnwu**](https://github.com/topjohnwu): Magisk و Zygisk API.
- كل المترجمين في [TRANSLATOR.md](../TRANSLATOR.md).

## الترخيص

NextZygisk مرخّص مثل ReZygisk تحت [GNU Affero General Public License v3.0](../LICENSE)، وهو نسخة معدّلة من ReZygisk. شوف [NOTICE](../NOTICE).

</div>
