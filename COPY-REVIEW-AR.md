# Arabic copy review — required before launch

The Arabic strings below are first-pass translations. Every key must be
reviewed by a native Arabic speaker (Saudi dialect preferred) before V1
launch. Do **not** translate by machine — we want warmth and clarity,
not literal parity with the English.

For each key, verify:

1. Dialect is natural Saudi Arabic (MSA is fine where it reads cleanly).
2. Brand voice — warm, sweet, confident. Not formal-stiff.
3. Variables render correctly when substituted (e.g. `{{name}}`, `{{max}}`).
4. RTL typography looks clean in-context (no orphaned punctuation).

---

## `locales/ar/common.json`

| Key | English source | Current AR |
| --- | --- | --- |
| `app.name` | Kayan Sweets | كيان للحلويات |
| `app.tagline` | Sweet rewards, every visit. | مكافآت حلوة، كل زيارة. |
| `actions.continue` | Continue | متابعة |
| `actions.back` | Back | رجوع |
| `actions.retry` | Try again | حاول مرة أخرى |
| `actions.cancel` | Cancel | إلغاء |
| `actions.submit` | Submit | إرسال |
| `actions.confirm` | Confirm | تأكيد |
| `actions.resend` | Resend code | إعادة إرسال الرمز |
| `actions.contactStaff` | Contact staff | تواصل مع الموظف |
| `status.loading` | Loading… | جارٍ التحميل… |
| `status.comingSoon` | Coming soon | قريباً |
| `status.errorTitle` | Something went wrong | حدث خطأ |
| `status.unknownError` | An unexpected error occurred. | حدث خطأ غير متوقع. |

## `locales/ar/customer.json`

### scan
| Key | EN | AR |
| --- | --- | --- |
| `scan.eyebrow` | Welcome | أهلاً بك |
| `scan.title` | KAYAN SWEETS | كيان للحلويات |
| `scan.branchLabel` | Branch | الفرع |
| `scan.description` | Tap continue to collect your stamp. | اضغط متابعة لتجميع ختمك. |
| `scan.cta` | Continue | متابعة |
| `scan.invalid.title` | Invalid scan code | رمز غير صالح |
| `scan.invalid.body` | This QR code doesn't match an active Kayan branch. Please ask a staff member for help. | رمز الاستجابة السريعة هذا لا يطابق أي فرع فعّال. الرجاء مراجعة أحد الموظفين. |
| `scan.loading` | Finding your branch… | جاري تحديد الفرع… |

### phone
| Key | EN | AR |
| --- | --- | --- |
| `phone.eyebrow` | Verify | التحقق |
| `phone.title` | ENTER YOUR PHONE | أدخل رقم جوالك |
| `phone.description` | We'll use this to find your rewards card. | سنستخدمه للعثور على بطاقة مكافآتك. |
| `phone.inputLabel` | Saudi mobile number | رقم الجوال السعودي |
| `phone.cta` | Continue | متابعة |
| `phone.errors.format` | Enter a 9-digit Saudi mobile starting with 5. | أدخل 9 أرقام تبدأ بـ 5. |

### registerOtp
| Key | EN | AR |
| --- | --- | --- |
| `registerOtp.eyebrow` | Verify | التحقق |
| `registerOtp.title` | ENTER YOUR CODE | أدخل الرمز |
| `registerOtp.description` | We sent a 4-digit code to {{phone}}. | أرسلنا رمزًا من 4 أرقام إلى {{phone}}. |
| `registerOtp.resendIn` | Resend in {{seconds}}s | إعادة الإرسال بعد {{seconds}} ث |
| `registerOtp.resend` | Resend code | إعادة إرسال الرمز |
| `registerOtp.cta` | Verify | تحقق |
| `registerOtp.errors.format` | Enter the 4-digit code you received. | أدخل الرمز المكون من 4 أرقام. |

### registerDetails
| Key | EN | AR |
| --- | --- | --- |
| `registerDetails.eyebrow` | Register | التسجيل |
| `registerDetails.title` | TELL US ABOUT YOU | عرّفنا على نفسك |
| `registerDetails.description` | Takes less than 30 seconds. | أقل من 30 ثانية. |
| `registerDetails.nameLabel` | Full name | الاسم الكامل |
| `registerDetails.namePlaceholder` | e.g. Fatimah Al-Harbi | مثال: فاطمة الحربي |
| `registerDetails.birthdayLabel` | Birthday | تاريخ الميلاد |
| `registerDetails.birthdayMonth` | Month | الشهر |
| `registerDetails.birthdayDay` | Day | اليوم |
| `registerDetails.preferredBranchLabel` | Preferred branch | الفرع المفضل |
| `registerDetails.languageLabel` | Preferred language | اللغة المفضلة |
| `registerDetails.consentLabel` | I agree to receive promotional messages from Kayan Sweets. | أوافق على استلام رسائل ترويجية من كيان للحلويات. |
| `registerDetails.cta` | Create my card | إنشاء بطاقتي |
| `registerDetails.errors.nameRequired` | Please enter your name. | الرجاء إدخال اسمك. |
| `registerDetails.errors.branchRequired` | Please pick a branch. | الرجاء اختيار فرع. |
| `registerDetails.errors.consentRequired` | You must agree to continue. | يجب الموافقة للمتابعة. |

### scanAmount
| Key | EN | AR |
| --- | --- | --- |
| `scanAmount.eyebrow` | Your visit | زيارتك |
| `scanAmount.title` | ENTER BILL AMOUNT | أدخل قيمة الفاتورة |
| `scanAmount.description` | Tell us your bill total so we can log this visit. | أخبرنا بإجمالي فاتورتك لتسجيل هذه الزيارة. |
| `scanAmount.inputLabel` | Bill amount | قيمة الفاتورة |
| `scanAmount.currency` | SAR | ر.س |
| `scanAmount.quickPickLabel` | Quick pick | اختيار سريع |
| `scanAmount.cta` | Earn my stamp | احصل على ختمي |
| `scanAmount.errors.range` | Amount must be between {{min}} and {{max}} SAR. | يجب أن تكون القيمة بين {{min}} و {{max}} ر.س. |
| `scanAmount.errors.required` | Enter an amount. | أدخل القيمة. |

### stampSuccess
| Key | EN | AR |
| --- | --- | --- |
| `stampSuccess.eyebrow` | Stamped | تم الختم |
| `stampSuccess.title` | +1 STAMP | +١ ختم |
| `stampSuccess.description` | Nice one, {{name}}. See you again soon. | أحسنت يا {{name}}. نراك مجددًا قريبًا. |
| `stampSuccess.progressLabel` | Your card | بطاقتك |
| `stampSuccess.countLabel` | {{current}} of {{max}} stamps | {{current}} من {{max}} أختام |
| `stampSuccess.nextReward` | Next reward at {{max}} stamps. | المكافأة التالية عند {{max}} أختام. |
| `stampSuccess.cardFull` | Card full! Your reward is ready. | اكتملت البطاقة! مكافأتك جاهزة. |
| `stampSuccess.viewRewards` | View my rewards | عرض مكافآتي |
| `stampSuccess.done` | Done | تم |

### lockout
| Key | EN | AR |
| --- | --- | --- |
| `lockout.eyebrow` | Already stamped | تم الختم مسبقًا |
| `lockout.title` | COME BACK TOMORROW | عد مجددًا غدًا |
| `lockout.description` | You've already earned a stamp today. Your next stamp is available {{when}}. | حصلت على ختم اليوم بالفعل. الختم التالي متاح {{when}}. |
| `lockout.whenShortly` | shortly | قريبًا |
| `lockout.cta` | Back to start | العودة إلى البداية |

### rewards
| Key | EN | AR |
| --- | --- | --- |
| `rewards.eyebrow` | Your rewards | مكافآتك |
| `rewards.title` | MY REWARDS | مكافآتي |
| `rewards.description` | Your current progress and active rewards. | تقدمك الحالي ومكافآتك الفعالة. |
| `rewards.progressSection` | Progress | التقدم |
| `rewards.availableSection` | Available | المتاحة |
| `rewards.historySection` | History | السجل |
| `rewards.emptyAvailable` | No rewards to claim yet — keep earning stamps. | لا توجد مكافآت للاستبدال — استمر في جمع الأختام. |
| `rewards.emptyHistory` | You haven't claimed any rewards yet. | لم تستبدل أي مكافأة بعد. |
| `rewards.claimCta` | Claim | استبدال |
| `rewards.statusPending` | Ready to claim | جاهزة للاستبدال |
| `rewards.statusRedeemed` | Redeemed | تم استبدالها |
| `rewards.statusExpired` | Expired | منتهية |
| `rewards.expiresOn` | Expires {{date}} | تنتهي {{date}} |
| `rewards.redeemedOn` | Redeemed {{date}} | استُبدلت {{date}} |

### rewardClaim / rewardConfirm / rewardDone
| Key | EN | AR |
| --- | --- | --- |
| `rewardClaim.eyebrow` | Redeem | استبدال |
| `rewardClaim.title` | CLAIM AT BRANCH | استبدل في الفرع |
| `rewardClaim.description` | Show this screen to the cashier. They'll scan the branch QR to verify. | أظهر هذه الشاشة للكاشير. سيقوم بمسح رمز الفرع للتحقق. |
| `rewardClaim.codeLabel` | Reward code | رمز المكافأة |
| `rewardClaim.expiresLabel` | Expires {{date}} | تنتهي {{date}} |
| `rewardClaim.cta` | Start redemption | ابدأ الاستبدال |
| `rewardClaim.notFound` | That reward could not be found. | تعذر العثور على تلك المكافأة. |
| `rewardConfirm.eyebrow` | Show the cashier | أظهر للكاشير |
| `rewardConfirm.title` | HAND OVER TO STAFF | سلّم الهاتف للموظف |
| `rewardConfirm.description` | The cashier will confirm redemption below. | سيقوم الكاشير بتأكيد الاستبدال في الأسفل. |
| `rewardConfirm.codeLabel` | Reward code | رمز المكافأة |
| `rewardConfirm.customerLabel` | For | للعميل |
| `rewardConfirm.cta` | Staff: confirm redeemed | الموظف: تأكيد الاستبدال |
| `rewardConfirm.cancelCta` | Cancel | إلغاء |
| `rewardDone.eyebrow` | Enjoy! | بالهناء! |
| `rewardDone.title` | REDEEMED | تم الاستبدال |
| `rewardDone.description` | Your reward has been redeemed. Thank you for visiting Kayan. | تم استبدال مكافأتك. شكرًا لزيارتك كيان. |
| `rewardDone.cta` | Back to rewards | العودة إلى المكافآت |

### errors
| Key | EN | AR |
| --- | --- | --- |
| `errors.network` | No connection. Please check your internet and try again. | لا يوجد اتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى. |
| `errors.rateLimited` | Too many attempts. Please wait and try again. | محاولات كثيرة جدًا. الرجاء الانتظار والمحاولة لاحقًا. |
| `errors.otpInvalid` | That code doesn't match. Check and try again. | الرمز غير مطابق. تحقق وحاول مرة أخرى. |
| `errors.otpExpired` | That code expired. Request a new one. | انتهت صلاحية الرمز. اطلب رمزًا جديدًا. |
| `errors.phoneInvalid` | Phone number format is not valid. | صيغة رقم الجوال غير صحيحة. |
| `errors.unknown` | Something went wrong. Please try again. | حدث خطأ ما. الرجاء المحاولة مرة أخرى. |

### install / offline (added in chunk 8b)
| Key | EN | AR |
| --- | --- | --- |
| `install.prompt.title` | Add Kayan to your home screen | أضف كيان إلى الشاشة الرئيسية |
| `install.prompt.cta` | Install | تثبيت |
| `install.prompt.dismiss` | Not now | ليس الآن |
| `offline.title` | You're offline | لا يوجد اتصال بالإنترنت |
| `offline.description` | Check your connection and try again. | تحقق من اتصالك وحاول مرة أخرى. |
| `offline.retry` | Try again | حاول مرة أخرى |

### months
Arabic month names already use standard Gregorian transliterations
(يناير, فبراير, …). Verify preferred form — Saudi audiences sometimes
use Levantine-origin names (كانون الثاني, شباط, …). Current rendering
uses Gregorian, which is the safer default for KSA.
