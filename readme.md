<div align="center">

# 🛡️ SafeHer Nepal

### AI-Powered Safety Companion for Solo Travelers in Nepal

_Making solo travel safer, smarter, and more confident._

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Under%20Development-orange)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-green)
![Built With](https://img.shields.io/badge/Built%20With-MERN%20Stack-blue)
![Hackathon](https://img.shields.io/badge/National%20AI%20Hackathon-2026-red)

**National AI Hackathon 2026 Project**

---

_Empowering safer journeys across Nepal through Artificial Intelligence._

</div>

---

# 📖 Overview

**SafeHer Nepal** is an AI-powered travel safety platform designed to empower solo travelers—especially women—by providing real-time safety intelligence, emergency assistance, scam prevention, and trusted local recommendations.

Traveling alone should be about creating unforgettable experiences—not worrying about personal safety.

SafeHer Nepal combines **Artificial Intelligence**, **Geolocation**, **Crowdsourced Community Reports**, and **Emergency Response Systems** into one unified platform that helps travelers make informed decisions before and during their journey.

---

# ❗ Problem Statement

Solo travelers in Nepal frequently encounter challenges such as:

- 🚶 Personal safety concerns
- 🚨 Harassment and stalking
- 💸 Tourist scams and fraud
- 🌙 Unsafe walking routes at night
- 🗣️ Language barriers
- 🏥 Difficulty locating emergency services
- 📍 Lack of verified local information
- 🚕 Finding trusted accommodations and transportation

Current travel applications mainly focus on **navigation**, **hotel booking**, and **tourism discovery**, while traveler safety remains largely overlooked.

---

# 🎯 Our Solution

SafeHer Nepal provides a complete AI-powered travel safety ecosystem that enables travelers to:

- 🧠 View AI-generated safety scores
- 🗺️ Navigate using the safest available routes
- 🚨 Trigger emergency SOS alerts instantly
- ⚠️ Receive real-time hazard notifications
- 📝 Report unsafe incidents anonymously
- 🤖 Detect common tourist scams
- 🏨 Find verified accommodations, taxis, and guides
- 🌐 Access essential safety resources even offline

---

# ✨ Core Features

## 🧠 AI Safety Score

Generate neighborhood safety scores using multiple factors:

- Historical incidents
- Community reports
- Crowd density
- Time of day
- Lighting conditions
- Nearby emergency services

---

## 🚨 One-Tap SOS

During emergencies users can instantly:

- Share live GPS location
- Notify emergency contacts
- Alert nearby authorities
- Record audio evidence
- Trigger emergency notifications

---

## 🗺️ Safe Route Navigation

Unlike traditional navigation systems, SafeHer Nepal recommends routes based on:

- Well-lit streets
- Crowded roads
- CCTV coverage
- Police patrol areas
- Community safety ratings

---

## ⚠️ Community Incident Reporting

Users can anonymously report:

- Harassment
- Theft
- Unsafe locations
- Road blockages
- Natural hazards
- Tourist scams

Community reports continuously improve the safety database for future travelers.

---

## 🤖 AI Scam Detection

The AI detects potential scams by analyzing:

- Community reports
- Scam patterns
- Tourist hotspot incidents
- Repeated complaints

Travelers receive proactive scam alerts before entering high-risk areas.

---

## 🏨 Verified Safe Places

Discover trusted:

- Hotels
- Hostels
- Homestays
- Cafés
- Restaurants
- Taxi services
- Local guides

Recommendations are based on verified safety ratings and community feedback.

---

## 🌐 Offline Support

Essential safety features remain accessible without internet:

- Offline maps
- Emergency contacts
- Medical information
- SOS preparation
- Basic Nepali translations

---

# 🏗️ System Architecture

```text
                    +----------------------+
                    |    React Frontend    |
                    +----------+-----------+
                               |
                  REST API / Socket.IO
                               |
        +----------------------+----------------------+
        |                                             |
+---------------------+                   +----------------------+
| Authentication API  |                   | AI Safety Engine     |
+---------------------+                   +----------------------+
        |                                             |
        +----------------------+----------------------+
                               |
                       Express.js Backend
                               |
                     MongoDB + Mongoose
                               |
     +------------+------------+------------+------------+
     |            |            |            |            |
   Users      Reports      Alerts      Locations     Reviews
```

---

# 🛠️ Tech Stack

## 🎨 Frontend

- React.js
- Tailwind CSS
- Leaflet / Google Maps
- Socket.IO

## ⚙️ Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

## 🤖 Artificial Intelligence

- Safety Score Prediction
- Scam Classification
- Route Risk Analysis
- Natural Language Processing (NLP)

## 🔗 APIs

- Google Maps API
- OpenStreetMap
- Weather API
- Reverse Geocoding API
- Emergency Services API

---

# 📂 Project Structure

```text
SafeHer-Nepal/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── assets/
│   │   └── utils/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── services/
│   └── utils/
│
├── docs/
├── README.md
├── package.json
└── .env.example
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/SafeHer-Nepal.git

# Navigate to the project
cd SafeHer-Nepal

# Install dependencies
npm install

# Start development server
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GOOGLE_MAPS_API_KEY=your_google_maps_api_key

OPENAI_API_KEY=your_openai_api_key
```

---

# 🗺️ Future Roadmap

- [ ] AI-powered route optimization
- [ ] Voice-activated SOS
- [ ] Smart wearable integration
- [ ] Offline AI assistant
- [ ] Fake review detection
- [ ] Women-only travel community
- [ ] Government emergency integration
- [ ] Smartwatch support
- [ ] Real-time disaster alerts
- [ ] Predictive crime analytics

---

# 🤝 Contributing

We welcome contributions from developers, designers, researchers, and travel enthusiasts.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ❤️ Acknowledgements

Special thanks to:

- Solo travelers who inspired this project
- Open-source contributors
- Mapping communities
- Emergency response organizations
- National AI Hackathon organizers

---

<div align="center">

## 🌏 Every Journey Deserves to Be Safe

**Built with ❤️ in Nepal for the National AI Hackathon 2026**

_Helping solo travelers explore Nepal with confidence._

</div>
