
# SUDANSCOUT - Sudan Scouts and Guides in Kuwait

This is a comprehensive, bilingual (Arabic/English) web application for the Sudan Scouts and Guides group in Kuwait. It serves as a central hub for members, administrators, and the public.

## Key Features

- **Fully Bilingual:** Seamless language switching between English and Arabic (RTL support).
- **Public-Facing Site:**
  - Home page with hero section and featured content.
  - Detailed 'About Us' page showcasing the mission, history, and leadership.
  - E-commerce 'Store' for selling scout gear and apparel.
  - 'Contact Us' form that integrates with WhatsApp for easy communication.
- **Member Portal:**
  - Members can search for their profile using a unique Scout ID.
  - View personal details, group information, and a detailed payment history.
  - "Pay Now" feature to initiate payments via WhatsApp.
- **Admin Section:**
  - Secure login for a designated administrator.
  - **Member Management (CRUD):**
    - View a list of all members.
    - Create, edit, and delete member profiles.
    - Manage individual payment records for each member.
  - **Product Management (CRUD):**
    - Add, edit, and delete products in the store.
  - **Bulk Data Management:**
    - Export all member data to a CSV file.
    - Import member data from a CSV file, with intelligent parsing and validation.
- **Shopping Cart:**
  - Persistent shopping cart for the e-commerce store.
  - Full checkout process that compiles an order summary for WhatsApp.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Firebase Auth)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **AI (Optional/Future):** [Genkit](https://firebase.google.com/docs/genkit)
- **CSV Parsing:** [PapaParse](https://www.papaparse.com/)

This project is built to be robust, maintainable, and provide a great user experience for all user types.
