# Product

ICN PAIM is an **LTI 1.3 Tool Provider** that integrates a Blackboard Learn LMS with a WordPress content backend to deliver structured learning experiences to students.

## What it does

- Receives LTI launches from Blackboard (LTI 1.1 and 1.3, deep linking, proctoring, names & roles).
- Presents students with **Units** made up of **Content cards** (videos, quizzes, and other activities) and tracks their **Progress**.
- Computes and reports **Grades**, and pushes them back to Blackboard's gradebook (grade passback / assign grades).
- Supports **Learning Routes**: grade-based branching that routes students to different content depending on performance.
- Provides an **Admin** area to manage contents, units, and learning routes.
- Syncs content and student/progress data with a **WordPress** site (via the WP REST API and Custom Post Types).

## Users

- **Students** launching activities from within a Blackboard course.
- **Instructors / admins** configuring units, contents, and learning routes.

## Notes

- UI text and inline comments are frequently in **Spanish**; keep that convention when editing user-facing strings.
- The tool is deployed publicly (e.g. `lti.icnpaim.cl`) and talks to `icnpaim.cl` for WordPress content.
