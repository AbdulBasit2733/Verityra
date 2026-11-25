# i ZONE (I Zone Coaching Classes) — Admin Panel Complete Usage Guide (Hinglish)

Yeh guide **Admin Panel (`/admin`)** ko shuru se end tak use karne ke liye banayi gayi hai. Isme har screen, har sidebar option, har button click, form filling, aur result kahan check karna hai — sab kuch step-by-step simple Hinglish me diya gaya hai.

---

## Table of Contents

1. [Admin Panel Login & Access](#1-admin-panel-login--access)
2. [Navigation, Sidebar, Search & Shortcuts](#2-navigation-sidebar-search--shortcuts)
3. [Common Table & Filter Controls (Har Page Par Useful)](#3-common-table--filter-controls-har-page-par-useful)
4. [Recommended Setup Order (Naya Course/Test Launch Kaise Karein)](#4-recommended-setup-order-naya-coursetest-launch-kaise-karein)
5. [Overview Dashboard (`/admin`)](#5-overview-dashboard-admin)
6. [Academic Masters (`/admin/masters/*`) — Subjects, Standards & Boards](#6-academic-masters-adminmasters--subjects-standards--boards)
7. [Test Series & Bundles (`/admin/test-series`)](#7-test-series--bundles-admintest-series)
8. [Subject Tests (`/admin/tests`)](#8-subject-tests-admintests)
9. [Question Paper Bank (`/admin/question-papers`)](#9-question-paper-bank-adminquestion-papers)
10. [Submissions Queue & Score Review (`/admin/submissions`)](#10-submissions-queue--score-review-adminsubmissions)
11. [Candidates & Attempt Overrides (`/admin/students`)](#11-candidates--attempt-overrides-adminstudents)
12. [Payments & Financials (`/admin/payments`)](#12-payments--financials-adminpayments)
13. [Profile, Password & Governance (`/admin/profile`)](#13-profile-password--governance-adminprofile)
14. [Quick Troubleshooting & Important Rules](#14-quick-troubleshooting--important-rules)

---

## 1. Admin Panel Login & Access

1. Browser me website ke **Sign In** page (`/signin`) par jaayein.
2. **Registered Email** box me apna Admin email daalein.
3. **Account Password** box me apna password daalein (password dekhne ke liye right side ke **Eye icon** par click kar sakte hain).
4. **Sign In to Workspace** button par click karein.
5. **Result Check:** Agar aapka account `ADMIN` role ka hai, toh system aapko automatically `/admin` (**Analytics overview**) dashboard par le jaayega.
   - *Note:* Agar aap password bhool gaye hain, toh **Forgot password?** link par click karke `/forgot-password` se reset kar sakte hain.

---

## 2. Navigation, Sidebar, Search & Shortcuts

### A. Desktop Screen (Laptop / PC)
Left side me **Sidebar** dikhta hai jo 5 sections me divided hai:

- **Oversight & Grading**
  - **Overview** (`/admin`) — Analytics, revenue, aur pending alerts
  - **Submissions Queue** (`/admin/submissions`) — Students ki answer sheets check aur review karne ke liye
- **Academic Management**
  - **Test Series & Bundles** (`/admin/test-series`) — Main batch/bundle packages manage karne ke liye
  - **Subject Tests** (`/admin/tests`) — Individual subject tests (Maths, Science, etc.) manage karne ke liye
  - **Question Paper Bank** (`/admin/question-papers`) — Free/public question papers PDF library
- **Academic Masters**
  - **Subject Master** (`/admin/masters/subjects`) — Subjects list add/edit karne ke liye
  - **Standard Master** (`/admin/masters/standards`) — Classes/Standards (e.g., Class 10th, NEET) add/edit karne ke liye
  - **Board Master** (`/admin/masters/boards`) — Boards/Streams (e.g., CBSE Board, ICSE) add/edit karne ke liye
- **Students & Revenue**
  - **Candidates & Overrides** (`/admin/students`) — Enrolled students aur extra attempt dene ke liye
  - **Payments & Financials** (`/admin/payments`) — Razorpay orders, ledger aur refunds ke liye
- **System**
  - **Profile & Settings** (`/admin/profile`) — Apna naam, phone, bio aur password badalne ke liye

**Sidebar Bottom Buttons:**
- **Profile Card** (Name + Email): Is par click karke **Profile & Settings** khulta hai.
- **Public Site**: Student/public website (`/`) dekhne ke liye.
- **Sign Out**: Logout karne ke liye (click karne par confirmation box **"Sign out of your session?"** aayega -> **Sign Out** dabayein).
- **Collapse Sidebar / Expand Sidebar** (ya keyboard shortcut `Ctrl + B` / `Cmd + B`): Sidebar ko chhota/bada karne ke liye.

**Top Header Bar (Desktop):**
- **Global Search Bar** (ya `Ctrl + K` / `Cmd + K`): Is par click karke aap turant kisi bhi page ya Quick Action (**Create New Test Series**, **Create Subject Test**, **Upload Question Paper**) par jump kar sakte hain.
- **+ Add New** (Blue button): Seedha **Create Test Series Bundle Master** (`/admin/test-series/new`) kholne ke liye.
- **Bell Icon**: Evaluation queue aur audit notification status check karne ke liye.
- **Right Top Avatar**: **Profile & Settings** par jaane ke liye.

### B. Mobile / Tablet Screen
- Upar left me **Menu (☰)** icon par tap karein — poora sidebar drawer khul jaayega.
- Neeche **Bottom Navigation Dock** me 5 quick buttons hote hain: **Overview**, **Tests**, **Submissions**, **Students**, **Profile**.

---

## 3. Common Table & Filter Controls (Har Page Par Useful)

Test Series, Subject Tests, Submissions, Candidates, aur Payments pages par ek common smart table toolbar milta hai:
1. **Page Refresh**: Page ke top-right me **Refresh** button se latest database data load hota hai.
2. **Search Box**: Student ka naam, email, test title, ya order ID type karke turant search karein.
3. **Grid / Table View Switcher**: Top-right toolbar me **Grid** (card view) ya **Table** (list view) par click karke layout badlein.
4. **Columns (X/Y)** button: Click karke checkboxes se decide karein ki kaunse columns dikhane ya chhupane hain.
5. **Filter Dropdowns & Date Filter**: Status, Subject, Standard, Board, ya Date ke hisaab se data filter karein.
6. **Reset / Reset all**: Sabhi filters aur search ek click me clear karne ke liye.
7. **Sorting**: Kisi bhi column header (e.g. `Submitted`, `Amount`, `Title`) par click karke Ascending/Descending sort karein.

---

## 4. Recommended Setup Order (Naya Course/Test Launch Kaise Karein)

Agar aap bilkul naya academic batch ya exam shuru kar rahe hain, toh **is order me kaam karein**:

1. **Step 1 — Masters check karein**: Pehle **Academic Masters** me check karein ki aapka **Subject**, **Standard**, aur **Board** bana hua hai ya nahi. Agar nahi, toh add karein.
2. **Step 2 — Test Series Bundle banayein**: **Test Series & Bundles** me jaakar ek main Batch/Bundle container banayein (e.g., *Class 10th CBSE Board 2025 Batch*).
3. **Step 3 — Subject Tests banayein / attach karein**: **Subject Tests** me jaakar Maths, Science, English wagairah ke individual tests banayein aur unhe upar wale Bundle se attach karein (ya standalone rakhein).
4. **Step 4 — Question Papers & Templates upload karein**: Test Series ke **Documents** tab ya **Subject Test** form me Question Paper PDF, Model Answer Key, aur Answer Sheet Template upload karein.
5. **Step 5 — Publish karein & Public Site par check karein**: Status ko **Live / Published** karein aur **External Link (View / Preview)** par click karke check karein ki students ko test sahi dikh raha hai ya nahi.

---

## 5. Overview Dashboard (`/admin`)

**Kaise Jaayein:** Sidebar me **Oversight & Grading** -> **Overview** par click karein.

**Kya Karna Hai & Kya Dekhein:**
1. **Time Range Badlein**: Top-right me **7 days** ya **30 days** button par click karein. Saare KPI cards aur trend chart us range ke hisaab se update ho jaayenge.
2. **Attention Alerts Check Karein (Sabse Zaroori)**:
   - Agar page ke upar warning pills dikh rahi hain — **Pending reviews**, **Low-confidence evaluations**, ya **Failed AI jobs** — toh kisi par bhi click karein. Aap seedha **Submissions Queue** (`/admin/submissions`) par pahunch jaayenge jahan unhe solve karna hai.
3. **4 Main KPI Cards Dekhein**:
   - **Revenue**, **Enrollments**, **Submissions**, aur **New candidates** (har card me selected 7d/30d ka count, lifetime total, aur pichhle period ke muqable % growth/drop dikhta hai).
4. **Performance Trend Chart**:
   - Chart ke top-right me **Revenue**, **Submissions**, **Enrollments**, ya **New candidates** button par click karke graph switch karein.
   - Graph par mouse le jaane se har din ki exact value aur pichhle period (**Previous**) se comparison dikhta hai.
5. **Neeche ke Analytics Panels**:
   - **Submission status**: Total attempts ka breakdown (`Completed`, `Processing`, `Review required`, `Failed`, `Pending`).
   - **Score distribution**: Kitne students kis % band (`0–10` se `90–100`) me score kar rahe hain.
   - **Evaluation pipeline**: Kitne % evaluations grade ho chuke hain + **Background jobs** (`Completed`, `Queued`, `Retrying`, `Failed`).
   - **Quality at a glance**: Overall **Average score %**, published vs draft tests count, aur **Attempts used** (`Attempt 1`, `Attempt 2`, `Attempt 3`).
   - **Top test series**: Sabse zyada enrolled top 5 test series (yahan **Manage →** par click karke seedha Test Series page khol sakte hain).
   - **Payments**: Orders status breakdown aur total refunded amount.
6. **Quick Action**: Top-right me **+ Create test series** button se naya bundle banana shuru kar sakte hain.

---

## 6. Academic Masters (`/admin/masters/*`) — Subjects, Standards & Boards

Yeh dropdown lists hain jo naye Test Series aur Subject Tests banate waqt use hoti hain.

**Kaise Jaayein:**
- Sidebar me **Academic Masters** section ke neeche **Subject Master**, **Standard Master**, ya **Board Master** me se kisi par bhi click karein.
- Ek hi screen par upar 3 tabs milte hain: **Subjects**, **Standards / Classes**, aur **Boards / Streams** — aap yahin se tabs switch kar sakte hain.

### A. Naya Subject Add / Edit / Delete Karna (**Subjects** Tab)
1. **Add karne ke liye**: Top-right me blue button **+ Add Subject** par click karein.
2. Popup **`Add New Subject`** khulega. Usme bharein:
   - **Subject Name \*** (Required, e.g., `Mathematics`, `Physics`)
   - **Subject Code (Optional)** (e.g., `MATH`, `PHY`)
   - **Description / Curriculum Scope (Optional)**
   - **Active Status** checkbox ticked rakhein taaki test creation me dikhe.
3. **Create Subject** button par click karein.
4. **Edit karne ke liye**: List me us subject ke right side **Pencil icon** (`Edit Subject`) par click karein -> details badlein -> **Save Changes** click karein.
5. **Delete karne ke liye**: **Trash icon** (`Delete Subject`) par click karein -> confirmation box me **Delete Subject** dabayein. *(Purane tests safe rahenge, bas future dropdown se hat jaayega.)*
6. **Result Check:** Table me naya subject **Active** badge ke saath turant dikh jaayega, aur **Create Subject Test** ke Subject dropdown me available ho jaayega.

### B. Naya Standard / Class Add / Edit / Delete Karna (**Standards / Classes** Tab)
1. **Standards / Classes** tab par click karein -> top-right me **+ Add Standard** par click karein.
2. Popup **`Add New Standard / Class`** me bharein:
   - **Standard / Class Name \*** (e.g., `Class 10th`, `NEET-UG`)
   - **Short Code (Optional)** (e.g., `10th`, `NEET`)
   - **Sort Sequence** (Number daalein, e.g., `10`, taaki list sahi order me dikhe)
   - **Description (Optional)** & **Active Status** checkbox.
3. **Create Standard** par click karein. Edit/Delete ke liye row ke **Pencil** / **Trash** icon use karein.
4. **Result Check:** List me standard aur uska `Sort Order` dikhega, aur **Create Test Series** ke Standard dropdown me aa jaayega.

### C. Naya Board / Stream Add / Edit / Delete Karna (**Boards / Streams** Tab)
1. **Boards / Streams** tab par click karein -> top-right me **+ Add Board** par click karein.
2. Popup **`Add New Board / Stream`** me bharein:
   - **Board / Stream Name \*** (e.g., `CBSE Board`, `Maharashtra State Board`)
   - **Board Code (Optional)** (e.g., `CBSE`, `MSBSHSE`)
   - **Description (Optional)** & **Active Status** checkbox.
3. **Create Board** par click karein. Edit/Delete ke liye **Pencil** / **Trash** icon use karein.
4. **Result Check:** Board table me add ho jaayega aur **Create Test Series** ke Board dropdown me dikhega.

---

## 7. Test Series & Bundles (`/admin/test-series`)

**Kaise Jaayein:** Sidebar me **Academic Management** -> **Test Series & Bundles** par click karein.

### A. Catalog Dekhna, Filter Karna & Quick Actions
- Page ke upar 4 KPI cards dikhte hain: **Total Test Series**, **Published Tests**, **Draft Tests**, aur **Total Aspirants**.
- Neeche table me filters milte hain: **Subject**, **Board**, **Standard**, **Series Format** (`All-Subject Bundles` / `Single Subject Tests`), **Publication Status**, **Pricing Type** (`Free Tests` / `Paid Tests`), aur **Creation Date**.
- Har Test Series row ke right side **Actions** me 4 buttons hain:
  1. **Globe / EyeOff Icon** (`Publish to catalog` / `Unpublish to draft`): Ek click se test series ko Live ya Draft karne ke liye. Popup aane par **Publish to Catalog** ya **Unpublish to Draft** confirm karein.
  2. **Edit Icon** (`Manage test series`): Test series ki full settings, instructions, subject tests aur documents kholne ke liye (`/admin/test-series/[id]`).
  3. **External Link Icon** (`Preview candidate view in new tab`): Naye tab me `/tests/[id]` khul kar dikhayega ki student ko yeh bundle kaisa dikh raha hai.
  4. **Trash Icon** (`Delete test series`): Bundle delete karne ke liye -> **Delete Test Series** confirm karein. *(Agar is series me paid orders/payments ho chuki hain, toh warning popup **`Force Delete Test Series?`** aayega — sirf zaroorat hone par hi **Yes, Force Delete** dabayein.)*

### B. Naya Test Series Bundle Banana (`/admin/test-series/new`)
1. **Test Series Catalog** par **+ Create Test Series** button par click karein (ya top bar me **+ Add New** dabayein).
2. Left column (**Master Classification**):
   - **Standard / Class Master \*** dropdown me search karke Class select karein (e.g., `Class 10th`).
   - **Examination Board / Stream \*** dropdown se Board select karein (e.g., `CBSE Board`).
   - **Academic Batch / Year \*** me batch likhein ya neeche diye chips (`2025 Batch`, `2026 Batch`, etc.) par click karein.
   - *Important Rule:* Ek `Standard + Board + Academic Batch` combination sirf **ek hi baar** ban sakta hai. Agar same batch dobara banayenge toh system `Creation Blocked` error dega.
3. Left column (**Bundle Pricing & Badging**):
   - **Bundle Package Offer Price (INR ₹) \*** me amount daalein (Free ke liye `0` daalein).
   - **Promotional Badge** me badge text likhein ya quick chips (`All-Subjects Package`, `Complete Syllabus`, `40% Savings Bundle`, etc.) par click karein.
4. Right column (**Series Container Overview**):
   - **Test Series Bundle Title \*** check/edit karein (Standard aur Board select karne par title auto-suggest bhi hota hai).
   - **Curriculum Scope & Syllabus Overview** me syllabus aur details likhein.
   - Chahein toh **Schedule Start (Optional)** aur **Schedule End (Optional)** dates select karein.
   - **Publish to Catalog** checkbox ticked rakhein agar turant live karna hai (varna Draft me save karne ke liye untick karein).
5. **Create Test Series Master** button par click karein -> confirmation modal me **Create Series Bundle** dabayein.
6. **Result Check:** System aapko seedha naye bane bundle ke **Edit / Manage** page (`/admin/test-series/[id]`) par le jaayega.

### C. Existing Test Series Manage Karna (`/admin/test-series/[id]`)
Kisi bhi series par click karke ya **Edit icon** se is page par aayein.

**Top Header Buttons:**
- **Publish to Catalog / Unpublish**: Catalog visibility on/off karne ke liye.
- **Publish Leaderboard / Hide Leaderboard**: Jab test evaluate ho jaaye aur aap results public `/leaderboard` par dikhana chahein, tab **Publish Leaderboard** click karein -> popup me **Publish Leaderboard** confirm karein.
- **Delete Series**: Series delete karne ke liye.
- **Back to Catalog**: Wapas list par jaane ke liye.

**Is Page ke 4 Tabs:**
1. **Details** Tab:
   - Title, Syllabus & Scope Description, **Catalog Format** (`All-Subjects Bundle Package` / `Single Subject Series`), **Standard / Target Class**, **Stream / Specialization**, **Promotional Badge**, **Full Package Price (INR ₹)**, aur **Bundle Offer Price (INR ₹)** update karein.
   - Neeche **Save Changes** click karein -> popup confirm karein.
2. **Subject Tests** Tab:
   - Yahan is bundle ke andar ke saare subject tests dikhte hain.
   - **+ Add Subject Test** par click karke naya subject test banayein (yeh seedha `/admin/tests/new` kholega with this bundle pre-selected). *(Agar abhi 0 tests hain toh **Add First Subject Test** quick popup bhi use kar sakte hain.)*
   - **Assign Existing Test** button par click karke pehle se bane kisi test ko is bundle me jod sakte hain -> popup **`Assign Existing Test to Series`** me radio button se test chunein -> **Assign to Series** click karein.
   - Har attached test card par buttons milte hain: **Globe/EyeOff** (Live/Draft toggle), **Edit** (`/admin/tests/[id]`), **Remove** (bundle se hatakar standalone test bana deta hai, data delete nahi hota), aur **Trash** (permanently delete).
3. **Instructions** Tab:
   - **Student-Facing Instructions**: Yeh rules students ko exam ke waqt dikhte hain.
   - **Private Evaluation Instructions**: Yeh **Admin only** hai — AI grading aur human rubric rules ke liye hota hai aur students ko kabhi nahi dikhta.
   - Edit karne ke baad neeche **Save Changes** click karein.
4. **Documents** Tab:
   - **Upload Question Paper & Rubric** (Left side): **Paper Title** daalein -> **Paper PDF File** choose karein (PDF/JPG/PNG/WebP) -> **Rubric & Model Answer Summary** likhein -> **Upload Paper & Rubric** click karein.
   - **Upload Answer Sheet Template** (Right side): **Template Title** daalein -> **Template PDF / Image File** choose karein -> agar margin template compulsory hai toh **Strict Template Required for this examination** tick karein -> **Upload Printable Template** click karein.
   - **Result Check:** Upload hone ke baad neeche **Attached Question Papers** aur **Attached Margin Templates** sections me **View PDF** / **View Template** links dikhne lagenge.

---

## 8. Subject Tests (`/admin/tests`)

**Kaise Jaayein:** Sidebar me **Academic Management** -> **Subject Tests** par click karein.

### A. Subject Tests List Manage Karna
- Upar 4 KPI cards dikhte hain: **Total Subject Tests**, **Live Published**, **Attached to Bundles**, aur **Unique Subjects**.
- Filters: **Subject**, **Standard**, **Board**, **Format** (`Bundle Attached` / `Standalone Only`), **Status** (`Live Published` / `Draft`).
- **Quick Publish/Hide:** Table ke **Status** column me **Live** ya **Draft** badge par seedha click karke status toggle kar sakte hain.
- **Row Actions:**
  - **View**: Public student preview page (`/tests/[slug]`) naye tab me kholta hai.
  - **Edit**: Test ki poori details aur documents edit karne ke liye (`/admin/tests/[id]`).
  - **Trash Icon**: Subject test delete karne ke liye (confirm popup aayega).

### B. Naya Subject Test Banana / Edit Karna (`/admin/tests/new` & `/admin/tests/[id]`)
1. **Subject Tests Catalog** par **+ Create Subject Test** click karein.
2. Left Column — **Examination Documents**:
   - **Question Paper PDF**: Box par click karke student ke liye official question paper PDF upload karein.
   - **Model Answer Key PDF (Optional)**: AI reference ke liye model answer PDF upload karein.
   - **Answer Sheet Template PDF (Optional)**: Student ke printout ke liye blank template PDF upload karein.
   - *(Edit mode me agar file pehle se lagi hai toh **View**, **Replace**, ya **X** se remove kar sakte hain.)*
3. Left Column — **Attach to Test Series Bundle**:
   - Agar yeh test kisi bundle ka hissa hai, toh **Attach to Test Series Bundle** checkbox ticked rakhein aur **Target Test Series Bundle \*** dropdown se bundle select karein. (Standalone banana ho toh untick kar dein.)
   - **Allow Standalone Purchase**: Agar aap chahte hain ki student poora bundle kharide bina sirf yeh ek subject test kharid sake, toh ise tick karein aur **Individual Test Price (INR ₹)** daalein (`0` = Free).
4. Right Column — **Examination Parameters**:
   - **Subject Master \*** dropdown se Subject select karein (e.g., `Mathematics`).
   - **Test Title \*** daalein (e.g., `Class 10th Mathematics Standard Pre-Board Mock 1`).
   - **Max Marks \***, **Duration (Mins) \***, aur **Max Attempts** (default 3) bharein.
   - **Syllabus & Scope Description**, **Candidate Exam Workspace Instructions**, aur **Private AI Evaluation Instructions** (confidential) review/edit karein.
   - **Publish to Catalog** checkbox tick karein agar turant live karna hai.
5. **Create Subject Test** (ya edit mode me **Update Subject Test**) click karein -> confirmation popup me confirm karein.
6. **Result Check:** Aap wapas `/admin/tests` list par aa jaayenge, jahan naya test dikhega. Agar aapne bundle attach kiya hai, toh us Test Series ke **Subject Tests** tab aur student catalog (`/tests`) me bhi test dikhne lagega.

---

## 9. Question Paper Bank (`/admin/question-papers`)

Yeh public practice library (`/question-papers`) hai jahan se students aur visitors question papers dekh aur download kar sakte hain.

**Kaise Jaayein:** Sidebar me **Academic Management** -> **Question Paper Bank** par click karein.

### A. Paper Bank Manage Karna
- Upar 4 KPI cards: **Total Papers**, **Live Published**, **Total Downloads**, **Categories**.
- Search box + **Stream** filter + **Status** filter (`Published (Live)` / `Draft (Hidden)`) se papers dhoondhein.
- **Quick Live/Draft Toggle**: **Status** column me **Published** / **Draft** badge par click karke visibility badlein.
- **Row Actions (Right Side):**
  - **Eye Icon** (`Preview Document`): Browser ke andar hi PDF preview popup kholta hai (jisme **New Tab** aur **Download** buttons bhi hain).
  - **Download Icon** (`Download PDF`): PDF directly download karta hai.
  - **Trash Icon** (`Delete Paper`): Confirmation popup ke baad paper permanently delete karta hai.

### B. Naya Question Paper Upload Karne ke 2 Tareeke

**Tareeka 1 — `+ Quick Upload` (Sirf Paper Bank ke liye):**
1. Header me **+ Quick Upload** button par click karein -> modal **`Upload Question Paper`** khulega.
2. **Question Paper Title \***, **Examination Stream / Category \***, **Subject / Discipline**, **Exam Year**, **Max Marks**, **Duration (Mins)**, aur **Description** bharein.
3. **Question Paper Document (PDF)** dropzone me click ya drag-and-drop karke PDF select karein (Max 25 MB, sirf PDF).
4. **Publish to Public Library** checkbox check/uncheck karein -> **Upload & Save** click karein.
5. **Result Check:** Paper turant list me upar dikh jaayega aur public `/question-papers` page par live ho jaayega.

**Tareeka 2 — `Create Question Paper` (`/admin/question-papers/new` — Bundle Attachment ke saath):**
1. Header me blue button **Create Question Paper** par click karein.
2. Left side par PDF drag-and-drop karein (Max 25 MB).
3. Agar is paper ko kisi Test Series Bundle me **active Subject Test** ki tarah bhi add karna hai, toh **Attach to Test Series / Bundle** toggle ON karein -> **Select Target Test Series \*** chunein -> zaroorat ho toh **Allow Standalone Purchase** aur **Individual Subject Price (INR ₹)** set karein.
4. Right side par **Question Paper Title \***, **Subject Name \***, **Exam Stream / Board**, **Standard / Class**, **Academic Year**, **Maximum Marks**, **Duration (Minutes)**, aur **Publish to Public Library** bharein.
5. **Publish Question Paper** (ya agar bundle attached hai toh **Create & Attach to Series**) click karein -> confirmation popup me **Create Question Paper** dabayein.
6. **Result Check:** Paper Question Paper Bank (`/admin/question-papers` aur `/question-papers`) me aa jaayega, aur agar bundle attach kiya tha toh **Subject Tests** (`/admin/tests`) aur us Test Series ke andar bhi automatically ek Subject Test ban jaayega!

---

## 10. Submissions Queue & Score Review (`/admin/submissions`)

Jab student handwritten answer sheet PDF upload karta hai, toh AI evaluator usko check karta hai. Agar handwriting unclear ho, confidence low ho, ya admin verification chahiye ho, toh woh yahan aati hai.

**Kaise Jaayein:** Sidebar me **Oversight & Grading** -> **Submissions Queue** par click karein.

### A. Submissions List & Filters
- Upar 3 KPI cards: **Total Submissions**, **Flagged for Review**, **Finalized & Approved**.
- Filters: **Evaluation Status** (`Review Required`, `Completed`, `Processing`), **Flag Status** (`Flagged for Review`, `Clear Confidence`), **Test Series Paper**, **Attempt #** (`Attempt #1/2/3`), **Score Tier**, aur **Submitted Date**.
- **Row Actions:**
  - **Rotate Icon (`Re-evaluate`)**: Agar kisi submission ko dobara AI se check karwana hai (`COMPLETED`, `FAILED`, ya `REVIEW_REQUIRED` par dikhta hai), toh is par click karein -> popup **`Queue AI re-evaluation?`** me **Re-evaluate** dabayein.
  - **Download Icon**: Student ki scanned answer sheet PDF download karne ke liye.
  - **Edit Icon (`Review score`)**: Marks check aur adjust karne ke liye (`/admin/submissions/[id]`).

### B. Answer Sheet Check & Marks Adjust Karna (`/admin/submissions/[id]`)
1. Kisi bhi submission ke **Edit icon** (**Review Score**) par click karein.
2. Page ke upar candidate ka naam, attempt number, status badge, **Open answer sheet** button (PDF naye tab me kholne ke liye), aur **Re-evaluate (Run #X)** button dikhta hai.
3. Right side me **Review checklist** aur **Current score** card dikhta hai.
4. Main screen par 4 Tabs hain:
   - **Question review** tab (Default khulta hai):
     - Har question (`Q1`, `Q2`, ...) ke saamne **Awarded marks** box hota hai. Aap usme marks type karke badal sakte hain (system marks ko `0` aur `Max marks` ke beech automatically limit rakhta hai).
     - **Evaluator feedback** column me AI ka detailed feedback (`Missing`, `Why`, `Strengths`, `Expected`, `Improve`) padh sakte hain.
     - **Admin note** box me har question ke liye apna short audit reason likh sakte hain (e.g., *"Diagram marks added after manual check"*).
   - **Summary** tab: Total calculated marks, percentage, general feedback, aur **Open scanned booklet** / **Download booklet** buttons dikhte hain.
   - **History** tab: Is submission par ab tak jitni baar evaluation runs hue hain (`Run 1`, `Run 2`...), unka comparison aur score dikhta hai.
   - **Finalize** tab: **Overall admin review justification** box me final review summary/reason likhein.
5. Neeche bar me updated `Current review total` check karein aur **Save review & write audit log** button par click karein.
6. Confirmation popup **`Save Adjusted Scores & Finalize Evaluation?`** me **Approve & Write Audit Log** click karein.
7. **Result Check:**
   - Toast message aayega: *"Evaluation score finalized"*.
   - Audit log permanently save ho jaayega.
   - Student apne portal (`/student/evaluations/[submissionId]`) par updated marks aur feedback dekh paayega, aur agar Test Series ka Leaderboard published hai toh `/leaderboard` par rank bhi update ho jaayegi.

---

## 11. Candidates & Attempt Overrides (`/admin/students`)

Platform par har student ko ek test series ke liye default **3 attempts** milte hain. Agar kisi genuine reason (jaise scan blur ya technical issue) se student ko extra attempt chahiye, toh aap yahan se grant kar sakte hain.

**Kaise Jaayein:** Sidebar me **Students & Revenue** -> **Candidates & Overrides** par click karein.

**Step-by-Step Usage:**
1. Upar 3 KPI cards check karein: **Total Enrollments**, **Quotas Exhausted** (jinke saare attempts khatam ho chuke hain), aur **Overrides Granted**.
2. Student dhoondhne ke liye Search box (name, email, test title) ya Filters (**Quota Status**, **Test Series Paper**, **Attempts Tier**, **Enrollment Date**) use karein.
3. Har row me **Attempts Consumed** progress bar (`e.g. 3 / 3 used` with **Active** ya **Exhausted** badge) aur **Allowed Maximum** (`3 allowed`, ya `Overridden` badge) dikhta hai.
4. Kisi student ko `+1` extra attempt dene ke liye uski row ke right side **+ Override Limit** button par click karein.
5. Modal **`Audited Attempt Limit Override`** khulega:
   - **Mandatory Audit Justification** box me clear reason likhein (e.g., *"Approved re-submission due to verified scanner blur on attempt 2"*).
   - **Confirm & Grant Override** button par click karein.
6. Confirmation popup **`Confirm Attempt Override for [Student Name]?`** me **Grant Extra Attempt** click karein.
7. **Result Check:**
   - Toast message aayega aur table me us student ka **Allowed Maximum** `+1` badh jaayega (e.g., `3 allowed` -> `4 allowed` with **Overridden** badge).
   - Student ab apne dashboard (`/student/tests/[id]`) par jaakar ek aur attempt submit kar paayega.

---

## 12. Payments & Financials (`/admin/payments`)

Yahan saare Razorpay transactions, captured payments, pending orders, aur 7-day refund policy actions manage hote hain.

**Kaise Jaayein:** Sidebar me **Students & Revenue** -> **Payments & Financials** par click karein.

### A. Payments Dekhna & Stale Orders Sync Karna
1. Upar 4 KPI cards dekhein: **Total Captured Revenue**, **Successful Orders**, **7-Day Refund Eligible**, aur **Total Refunded Capital**.
2. Filters se **Payment Status** (`Captured / Completed`, `100% Refunded`, `Pending Capture`, `Failed / Abandoned`), **Test Series Paper**, **7-Day Return Window**, ya **Payment Date** filter karein.
3. **Gateway References** column me `Payment ID` ya `Order ID` ke paas **Copy icon** par click karke ID copy kar sakte hain.
4. **Pending Orders Sync Karna**: Agar kisi student ka payment kat gaya par status `Pending` atka hua dikh raha hai, toh page ke top-right me **Reconcile Stale Orders** button par click karein — yeh Razorpay API se pending orders ko sync kar dega.

### B. Transaction Audit Trail / Gateway Ledger Dekhna
1. Kisi bhi payment row ke right side **History icon** (`View payment ledger`) par click karein.
2. Modal **`Transaction Audit Trail & Gateway Ledger`** khulega jisme:
   - Candidate name, Amount, `Razorpay Payment ID`, aur `Bank Reference (RRN)` dikhega.
   - Neeche chronological timeline me webhooks, captures, aur admin actions dikhenge.
   - Technical detail dekhne ke liye **View Raw Gateway JSON** par click kar sakte hain.

### C. 100% Refund Issue Karna (Sirf `Captured / Completed` Payments Par)
1. Us payment row ke right side **Rotate Icon (`Issue refund`)** par click karein (tooltip me dikhta hai kitne din bache hain ya expired hai).
2. Modal **`Initiate 7-Day Policy Refund`** khulega:
   - Upar summary box me **Return Policy Status** (`Eligible` ya `Expired`) check karein.
   - **Agar student ne attempts use kar liye hain (`attemptsUsed > 0`)**: Amber warning box me checkbox tick karein -> *"I acknowledge evaluation costs are forfeited and confirm access revocation."*
   - **Agar 7-day return window expire ho chuki hai (`> 7 days`)**: Red warning box me checkbox tick karein -> *"Authorize Superadmin 7-Day Return Policy Override"*.
   - **Refund Reason (Audit Tag)** dropdown se sahi reason chunein (`Student Request (7-Day Return Window)`, `Accidental Duplicate Order`, `Technical Submission / Platform Issue`, `Fraudulent / Unauthorized Transaction`, ya `Administrative Goodwill Exception`).
   - **Administrative Explanation & Verification Notes** box me detailed verification note likhein (mandatory).
3. **Execute 100% Refund (₹Amount)** button par click karein.
4. Final confirmation popup **`Process 100% Refund (₹Amount)?`** me **Issue ₹Amount Refund** par click karein.
5. **Result Check:**
   - Razorpay par 100% reverse refund process ho jaayega aur toast notification aayegi.
   - Payment row ka status **Refunded** ho jaayega, **Total Refunded Capital** KPI update hoga, aur student ki test series enrollment cancel ho jaayegi.
   - **View payment ledger** kholkar aap refund event ka audit record bhi verify kar sakte hain.

---

## 13. Profile, Password & Governance (`/admin/profile`)

**Kaise Jaayein:** Sidebar ke bottom me **Profile & Settings** (ya apna Name/Avatar) par click karein.

Is page par 3 Tabs hain:

1. **Administrator Profile** Tab:
   - Yahan aap **Administrator Full Name**, **Emergency Escalation Contact (Optional)**, aur **Office Designation & Subjective Expertise** update kar sakte hain. *(Official Email Address aur System Role read-only hote hain.)*
   - **Save Admin Profile** click karein -> confirmation popup me **Save Changes** dabayein.
   - **Result Check:** Aapka naya naam sidebar, topbar aur future audit logs me dikhne lagega.
2. **Security & Password** Tab:
   - **Current Administrator Password** daalein.
   - **New Administrator Password** daalein — neeche diye 4 green checks pure hone chahiye:
     - Minimum 8 characters
     - At least 1 uppercase letter (`A-Z`)
     - At least 1 number (`0-9`)
     - At least 1 special character (`@`, `#`, `$`, etc.)
   - **Confirm New Password** me same password dobara daalein.
   - **Update Administrator Credentials** par click karein -> confirmation popup me **Update Password** dabayein.
   - **Result Check:** Agli baar login karne par naya password kaam karega.
3. **Platform Invariants & Governance** Tab:
   - Yahan system ke 4 core security & business rules ki summary dikhti hai (`Strict Three-Attempt Limit`, `Instruction Isolation`, `Zero-AI Marketing Policy`, `Immutable Audit Trail`) aur quick buttons (**Manage Test Series**, **Review Submissions**, **View Audit Trail**) milte hain.

---

## 14. Quick Troubleshooting & Important Rules

- **"Database not connected — showing sample data" banner dikh raha hai?**
  - Iska matlab server database se connect nahi hai (demo/fallback mode chal raha hai). Production me live changes save karne ke liye database connection active hona zaroori hai.
- **"Creation Blocked" jab Test Series Bundle bana rahe hain?**
  - Same `Standard + Board + Academic Batch` ke liye pehle se ek bundle bana hua hai. Purane bundle ko **Test Series Catalog** me search karke edit karein ya alag Academic Batch (e.g., `2026 Batch`) choose karein.
- **Re-evaluate click karne par worker error aa raha hai?**
  - Background evaluation worker (Redis + worker service) running hona chahiye tabhi AI re-evaluation queue process hogi.
- **Kya students ko "Private Evaluation Instructions" ya "Model Answer Key" dikhti hai?**
  - **Nahi.** Yeh sirf server-side AI grading aur admin ke liye hoti hain; students ko sirf **Student-Facing Instructions** aur **Question Paper / Blank Template** dikhta hai.
- **Leaderboard par results nahi dikh rahe?**
  - **Test Series & Bundles** -> us test series par click karein -> top header me **Publish Leaderboard** button ON karein.
