<p align="center">
  <img src="https://raw.githubusercontent.com/iq24-ai/iq24/main/.github/assets/hero.png" alt="IQ24.ai Hero Image">
</p>

<h1 align="center"><b>IQ24.ai</b></h1>

<p align="center">
  <b>The AI-Native B2B Growth Engine</b>
  <br />
  <br />
  <a href="https://go.iq24.ai/discord"><b>Join our Discord</b></a>
  ·
  <a href="https://iq24.ai">Website</a>
  ·
  <a href="https://github.com/iq24-ai/iq24/issues">Report an Issue</a>
  ·
  <a href="https://github.com/iq24-ai/iq24/blob/main/CONTRIBUTING.md">Contribute</a>
</p>

---

## About IQ24.ai

**IQ24.ai is an open-source, AI-native B2B prospecting and outreach platform designed to transform how businesses approach growth.** We are building a sophisticated multi-agent system that automates and augments the entire sales and marketing lifecycle, from identifying the perfect prospect to crafting hyper-personalized, multi-channel outreach that converts.

Our mission is to move beyond traditional, reactive sales tools and build a proactive, predictive engine that empowers B2B teams to work smarter, not harder.

## ✨ Core Features

*   **🧠 Multi-Agent AI Core:** A symphony of specialized AI agents (Prospect Discovery, Validation, Personalization, etc.) work together to manage complex workflows autonomously.
*   **🎯 Predictive Prospecting:** Goes beyond simple filters to identify high-intent leads using data analysis, graph networks, and behavioral signals.
*   **✍️ Hyper-Personalization Engine:** Leverages advanced LLMs to craft deeply personalized outreach messages tailored to each prospect's unique context, pain points, and recent activity.
*   **🎨 Multi-Sensory Outreach (MSEO):** The future of engagement. Generate and orchestrate outreach using not just text, but also AI-generated voice messages and personalized visuals.
*   **🚀 Adaptive Campaign Orchestration:** Our Adaptive Learning Orchestration (ALO) layer continuously analyzes campaign performance and dynamically adjusts strategies in real-time to maximize ROI.
*   **🛡️ Proactive Compliance Guardian:** An embedded compliance network ensures all outreach adheres to global regulations like GDPR and CCPA, mitigating risk and building trust.
*   **⚙️ Quantum-Inspired Optimization (Coming Soon):** We are researching quantum-inspired algorithms to solve complex optimization problems for resource allocation and campaign strategy at a scale previously impossible.

## 🏆 Recognition & Community

*We are just getting started! We aim to be featured on platforms like these soon. Your support and contributions can help us get there.*

<p align="center">
  <!-- Placeholder for future badges -->
  <a href="https://www.producthunt.com/posts/iq24">
    <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=460784&theme=dark" alt="IQ24 on Product Hunt (Example)" style="width: 250px; height: 54px;" width="250" height="54" />
  </a>
  <a href="https://news.ycombinator.com/item?id=40737901">
    <img style="width: 250px; height: 54px;" width="250" height="54" alt="Featured on Hacker News (Example)" src="https://hackernews-badge.vercel.app/api?id=40737901" />
  </a>
</p>

## 🚀 Get Started

We are actively building the core of IQ24.ai. The best way to get started is to join our community and contribute!

1.  **Fork & Clone:** Fork the repository and clone it to your local machine.
2.  **Install Dependencies:** We use `pnpm` as our package manager. Run `pnpm install` in the root directory.
3.  **Setup Environment:** Copy `.env.example` to `.env` and fill in the required keys (e.g., Supabase URL and anon key).
4.  **Run the Apps:** Use Turborepo to run specific applications: `turbo run dev --filter=dashboard`

For detailed setup instructions, please see our **[Contribution Guide](https://github.com/iq24-ai/iq24/blob/main/CONTRIBUTING.md)**.

## 🏗️ Architecture & Tech Stack

IQ24.ai is built on a modern, scalable, and AI-first technology stack, organized in a Turborepo monorepo.

#### **Applications**
*   **`dashboard`**: Next.js (App Router), React, TypeScript
*   **`engine`**: Hono.js (Node.js) & Python 3.x (AI/ML)
*   **`mobile`**: Expo (React Native)
*   **`website`**: Next.js (App Router)

#### **Core Technologies**
*   **Monorepo:** Turborepo, pnpm
*   **Frontend:** React, TypeScript, Next.js, Tailwind CSS, Shadcn/ui
*   **Mobile:** Expo, React Native
*   **Backend:** Hono.js, Python, FastAPI (for ML model serving)
*   **AI/ML:** PyTorch, Hugging Face Transformers, spaPy, Scrapy

#### **Infrastructure & Services**
*   **Database & Auth:** Supabase (PostgreSQL)
*   **Hosting:** Vercel (Frontend Apps), AWS/GCP (Backend Engine)
*   **Caching:** Upstash (Serverless Redis)
*   **Background Jobs:** Trigger.dev / Temporal.io
*   **Email:** Resend
*   **Notifications:** Novu (TBD)
*   **CI/CD:** GitHub Actions
*   **Analytics:** OpenPanel / PostHog
*   **Search:** Typesense / Meilisearch (TBD)

## 📊 Repo Activity

![IQ24.ai Repo Activity](https://repobeats.axiom.co/api/embed/96aae855e5dd87c30d53c1d154b37cf7aa5a89b3.svg "Repobeats analytics image")

## ⚖️ License

This project is licensed under the **[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)**.

#### **Commercial Use & Support**
For commercial licenses, dedicated deployments, or enterprise support, please contact us at **[sales@iq24.ai](mailto:sales@iq24.ai)**.

By using or contributing to this software, you agree to the terms of the license.
