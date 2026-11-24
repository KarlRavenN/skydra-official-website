SKYDRA Official Website 
Project Planning & Development Guide 
Version: 1.0 
1. Project Overview 
This project is the official website for SKYDRA Rap Battle League, an underground rap battle 
organization in the Philippines. 
The website serves as the league's official online platform where fans can: 
● View upcoming events 
● Register for free or paid events 
● Receive digital tickets 
● View battle lineups 
● Browse past events 
● Learn about SKYDRA 
The long-term goal is to build a professional platform similar to FlipTop's official website while 
maintaining SKYDRA's own underground identity and branding. 
The website should be designed mobile-first, since most visitors will access it through 
Facebook links. 
2. Project Goals 
Primary Goals: 
● Create an official online presence for SKYDRA 
● Allow fans to register without creating accounts 
● Generate digital tickets 
● Help organizers manage attendance 
● Archive every SKYDRA event 
Future Goals: 
● Paid ticketing 
● Merchandise 
● Rapper profiles 
● Rankings 
● Livestream pages 
● Event media galleries 
3. Design Direction 
Theme: 
Underground Hip-Hop 
Graffiti 
Street Culture 
Raw 
Authentic 
The design should NOT look corporate. 
Instead it should feel like: 
● Battle flyers 
● Spray paint 
● Concrete walls 
● Stickers 
● Torn posters 
● Urban photography 
● Underground events 
Keep everything clean enough to remain professional while preserving the street aesthetic. 
4. Target Audience 
Primary Users: 
● Rap battle fans 
● Event attendees 
● New viewers from Facebook 
● Partner cafés 
● Event sponsors 
Admin Users: 
● SKYDRA organizers 
● Event staff 
No public user accounts will exist. 
Only admins have accounts. 
5. Core Features (Phase 1) 
Public Website 
Home Page 
Displays: 
● Hero section 
● Upcoming event 
● Event cards 
● About SKYDRA 
● Social links 
Event Page 
Displays: 
● Poster 
● Event title 
● Date 
● Time 
● Venue 
● Google Maps 
● Battle lineup 
● Register button 
Registration 
Guest registration only. 
No login. 
Collect: 
● Full Name 
● Facebook Profile 
● Age 
● Contact Number 
● Barangay 
● City 
● Emergency Contact 
● Emergency Contact Number 
● House Rules Agreement 
● Privacy Agreement 
After submitting: 
Generate a digital ticket with: 
● Ticket ID 
● QR Code 
● Event Information 
● Attendee Name 
Past Events 
Archive previous SKYDRA events. 
Each event should still have: 
● Poster 
● Lineup 
● Photos (future) 
● Videos (future) 
6. Admin Dashboard (Phase 2) 
Dashboard 
● Event statistics 
● Registration count 
● Capacity 
● Checked-in attendees 
Events 
● Create event 
● Edit event 
● Archive event 
Registrations 
● Search attendees 
● Export CSV 
● Check-in attendees 
● Delete registrations 
Matchups 
● Add battles 
● Reorder battles 
● Edit battles 
Settings 
● League information 
● Social links 
● House Rules 
● Privacy Policy 
7. Initial Database Plan 
Events 
Stores: 
● Event information 
● Venue 
● Poster 
● Capacity 
● Registration status 
● Ticket type 
Matchups 
Stores: 
● Battle lineup 
● Event relationship 
● Order 
Registrations 
Stores attendee information. 
Each registration belongs to one event. 
Admins 
Stores organizer accounts only. 
8. Technology Stack 
Frontend 
● Next.js 
● React 
● TypeScript 
● Tailwind CSS 
Backend 
● Supabase 
● PostgreSQL 
● Storage 
● Authentication (Admin only) 
Hosting 
● GitHub 
● Vercel 
Additional Services 
● QR Code Generator 
● Google Maps 
9. Development Philosophy 
The project should always prioritize: 
● Simplicity 
● Fast loading 
● Mobile-first experience 
● Easy maintenance 
● Scalability 
Avoid unnecessary complexity. 
Every feature should solve a real problem. 
10. Development Roadmap 
Phase 1 
Foundation 
Tasks: 
● Create project 
● Configure Next.js 
● Configure Tailwind 
● Connect Supabase 
● Create database 
● Setup GitHub 
Phase 2 
Public Website 
Tasks: 
● Home page 
● Navigation 
● Event cards 
● Event page 
● Responsive layout 
Phase 3 
Registration 
Tasks: 
● Registration form 
● Form validation 
● Ticket generation 
● QR code generation 
● Confirmation page 
Phase 4 
Admin Dashboard 
Tasks: 
● Login 
● Event management 
● Registration management 
● CSV export 
● Check-in system 
Phase 5 
Visual Polish 
Tasks: 
● Animations 
● Graffiti styling 
● Performance optimization 
● SEO 
● Accessibility improvements 
11. Coding Standards 
The project should follow these principles: 
● Keep components reusable. 
● Avoid duplicated code. 
● Keep files organized. 
● Use TypeScript everywhere. 
● Keep UI responsive. 
● Follow clean architecture. 
● Prefer server-side features when appropriate. 
● Write maintainable code instead of quick fixes. 
12. Current Scope 
Current focus is ONLY building the MVP (Minimum Viable Product). 
Included: 
● Homepage 
● Event listing 
● Event details 
● Registration form 
● Digital ticket generation 
● Admin event management 
● Registration management 
Not included yet: 
● Online payments 
● Merchandise 
● Rankings 
● Rapper profiles 
● Livestream integration 
● Community accounts 
● Comments 
● Notifications 
These features will be added only after the MVP is stable. 
13. Important Reminder for Future AI 
Sessions 
When continuing this project: 
● Always preserve the existing architecture. 
● Do not replace technologies unless necessary. 
● Build features incrementally. 
● Avoid unnecessary dependencies. 
● Prioritize clean, production-ready code. 
● Keep the design consistent with the underground SKYDRA identity. 
● Explain major architectural decisions before implementing them. 
● Treat this document as the project's single source of truth unless it is intentionally 
updated. 
