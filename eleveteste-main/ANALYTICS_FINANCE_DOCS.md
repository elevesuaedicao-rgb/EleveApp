
# Documentation - Analytics & Finance Module

## Overview
This module implements Student Analytics, Financial Agreements, and Academic Performance tracking for the Teacher Portal.

## Database Schema (Supabase)
New tables created:
- `student_agreements`: Stores custom pricing per student (remote/in-person).
- `lesson_completion`: Stores post-class wizard data (mood, attention, notes).
- `lesson_topics`: Granular topic difficulty tracking linked to lessons.
- `student_topic_metrics`: Aggregated difficulty and trends per topic (with decay).
- `billing_cycles`: Financial periods for students.
- `billing_adjustments`: Credits/discounts/bonuses per cycle.
- `student_monthly_stats`: Aggregated monthly performance/finance stats.
- `analytics_events`: Base table for usage tracking.

## RPC Functions
- `create_or_update_student_agreement(student_id, ...)`: Upserts pricing agreement.
- `complete_lesson_wizard(booking_id, mood, attention, topics...)`: Finalizes a lesson and updates metrics.
- `get_student_projection(student_id, start, end)`: Returns real scheduled value vs historical average.
- `create_billing_cycle(student_id, start, end)`: Opens a new billing period.
- `add_billing_adjustment(cycle_id, type, amount)`: Adds value adjustments.
- `generate_billing_pdf_data(cycle_id)`: returns JSON for PDF generation.

## Frontend Components
### 1. Student Analytics Page (`/app/teacher/students/:studentId`)
- View projections (Real vs Historical).
- Manage financial agreements.
- View topic performance trends.
- Manage billing cycles and generate PDF reports.

### 2. Components
- `StudentAnalytics.tsx`: Main dashboard.
- `StudentAgreementDialog.tsx`: Modal to edit pricing.
- `LessonCompletionWizard.tsx`: Modal for post-class feedback.
- `billing-pdf.ts`: Utility to generate printable HTML reports.

## How to Test Manually
1. **Navigate to Teacher Portal**: Go to `/teacher/students`.
2. **Select a Student**: Click on a student card.
3. **Access Analytics**: The new route is `/app/teacher/students/:studentId`. You may need to manually navigate or add a link in the existing student profile.
   - *Note*: I added a "Settings" button in the Analytics header to go back to the Profile, and you should add a link from Profile to Analytics if desired.
4. **Edit Agreement**: Click the "Settings" icon on the "Acordo" card. Set prices (e.g. 50, 70).
5. **Check Projections**: Ensure the "Projeção" card shows values based on your scheduled classes.
6. **Generate Closing**: Click "Gerar Fechamento" in the "Fechamentos" card.
7. **Download PDF**: Click the download icon on the generated cycle.
8. **Check Topics**: If you complete a lesson using `complete_lesson_wizard` (via API or Wizard component), topics should appear in "Desempenho por Tópico".

## Future Improvements
- Integrate `LessonCompletionWizard` into the main Calendar flow.
- Add "Recurring vs Extra" breakdown in stats.
- Implement full Ranking UI.
