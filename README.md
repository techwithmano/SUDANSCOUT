# SudanScout 🏕️🧭

**SudanScout** is a fully functional and modern web system built for scouting organizations. It features a beautiful landing page, a product store, personalized scout profiles, and a dues tracking system — all built with simplicity, performance, and community needs in mind.

Hosted on **Vercel**, this platform makes it easy for scout admins to manage members, dues, and scout IDs, while giving members a clean and personal dashboard.

---

## 📦 Features

- 🌐 Public landing page with About & Contact sections
- 🛍️ Product store (no login required)
- 🧾 Dues tracking system (monthly payment records)
- 🪪 Scout ID system with personal profile pages
- 📝 Editable member info: name, photo, group, birth date
- 🧮 Downloadable database for accounting (CSV)
- 🔒 No login/signup required — ID-based access
- ⚡ Fully deployable on Vercel for free

---

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Firebase (Firestore or Realtime DB)
- **Hosting**: Vercel
- **Database**: Firebase (with export capability)

---

## 🧑‍💻 Usage

### 🛒 Store Access
- Accessible to everyone — add items, enter shipping info, and submit order.

### 🧑‍🦱 Scout Profile Access
- Members enter their **Scout ID** to view/edit their profile and dues.
- Each profile includes:
  - Name
  - Birth date
  - Group
  - Profile photo
  - Monthly dues payment tracker

---

## 📂 Folder Structure (Example)

```
sudanscout/
│
├── public/             # Static assets
├── pages/              # Landing, Store, Profile, Contact
├── components/         # Navbar, Footer, Forms, Profile Cards
├── lib/                # Firebase integration
├── styles/             # Tailwind & custom styles
├── firebase.json       # Firebase config
└── vercel.json         # Vercel deployment config
```

---

## 🚀 Deployment

This app is ready for **one-click deployment** on [Vercel](https://vercel.com):

1. Clone the repo:
   ```bash
   git clone https://github.com/techwithmano/SUDANSCOUT.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Connect to your Firebase project

4. Deploy with:
   ```bash
   vercel
   ```

---

## 🙌 Contributing

Want to add features or improve the system?
- Fork the repo
- Create a new branch
- Submit a pull request!

---

### Built with ❤️ by [Tech with Mano](https://github.com/techwithmano)
