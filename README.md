# 🌾 CropMax AI
> AI-Powered Crop Value Addition & Profit Recommendation System

## Problem
Farmers sell crops directly without knowing if processing them could earn more profit.

## Solution
Enter your crop, quantity, and location — CropMax AI recommends whether to sell raw,
process into products (juice, pickle, flour), or wait for better prices.

## Features
- 👨‍🌾 Farmer Dashboard — register, add crops, track recommendations
- 📊 Market Analysis — live prices, demand trends
- 💰 Profit Calculator — compare raw vs processed earnings
- 📈 Price Prediction — forecast best time to sell
- 🤖 AI Recommendations — powered by OpenAI GPT-4o

## Tech Stack
| Layer      | Technology            |
|------------|-----------------------|
| Frontend   | React + Next.js       |
| Styling    | Tailwind CSS          |
| Backend    | Node.js + Express.js  |
| Database   | MySQL                 |
| Auth       | JWT                   |
| AI         | OpenAI API (GPT-4o)   |
| Deployment | Vercel + Render       |

---

## Frontend Setup & Development

This is the frontend client for CropMax AI, built using Next.js (App Router) and Tailwind CSS.

### Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the running frontend skeleton.

### Core Components built this week:
- **Navbar**: Responsive global header with navigation links and profile avatar.
- **Hero Section**: Aesthetic banner displaying the pitch, key features, and dynamic mockup dashboard charts.
- **Crop Card**: Reusable product card accepting badges, status alerts, and customized call-to-actions.
- **Footer**: Structured platform directories, support details, and responsive social tags.
