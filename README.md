# Campus Buddy
**Multi-University Student Platform** — CS 321 Software Engineering, George Mason University

## Team
- Shayan Khan | Team Lead
- Noe Flores
- Aser Eshetu
- Enoch M Ogunfiditimi
- Kayla Suttihprapa

## What is Campus Buddy?
Campus Buddy is a web application that connects students across multiple Virginia universities through a single verified platform. Students register with their university email, get placed into a campus-specific network, and can collaborate with verified classmates through four core features.

**Supported universities:** George Mason University, Virginia Tech, University of Virginia, James Madison University, Virginia Commonwealth University, William & Mary, Old Dominion University

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React |
| Auth | Supabase Auth (email verification) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (profile photos) |
| Hosting | GitHub Pages |

## Features
### 1. Authentication & Student Profiles (Sprint 1)
Students register with their `@university.edu` email. The system verifies the domain and places them into their campus network. Students create a profile with name, major, academic year, and photo.

### 2. Study Group Organizer (Sprint 2)
Students create or join course-specific study groups with a meeting time and location. Only verified students from the same university can browse and join.

### 3. Campus Event Board (Sprint 3)
Students post and browse campus events. All events are posted by verified students from the same school. Students can RSVP directly in the platform.

### 4. Textbook Exchange Marketplace (Sprint 3)
Students list textbooks for sale by course code, price, and condition. Verified classmates can browse listings, contact sellers, and mark listings as sold.

## Requirements Research
Research notes, competitor analysis (GroupMe, Discord, Facebook Groups, Facebook Marketplace), and screenshots are documented in the [`requirements-research`](./requirements-research) folder.

**Key finding:** Every existing platform either lacks identity verification or is not built for academic collaboration. No platform combines verified student identity + study groups + events + textbook exchange in one place.

## Project Links
| Resource | Link |
|----------|------|
| GitHub Project Board | [Campus Buddy Development](https://github.com/AinzOoalGown1356/Campus-Buddy/projects) |
| Wiki / Use Case Diagram | [Use Case Diagram](https://github.com/AinzOoalGown1356/Campus-Buddy/wiki/Use-Case-Diagram) |
| Issue Tracker | [Issues](https://github.com/AinzOoalGown1356/Campus-Buddy/issues) |

## Sprint Plan
| Sprint | Feature | Effort |
|--------|---------|--------|
| Sprint 1 | Authentication & Student Profiles | 2 weeks |
| Sprint 2 | Study Group Organizer | 2 weeks |
| Sprint 3 | Campus Event Board + Textbook Marketplace | 2 weeks |
