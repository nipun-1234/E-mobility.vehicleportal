<div align="center">

<img src="./assets/banner.svg" alt="E-Mobility Vehicle Portal 3D banner" width="100%"/>

<br/>

![React](https://img.shields.io/badge/Mobile--First-PWA-00f5a0?style=for-the-badge&logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-npm-00d9f5?style=for-the-badge&logo=nodedotjs&logoColor=white)
![API](https://img.shields.io/badge/API-localhost:5000-7cf0ff?style=for-the-badge&logo=fastapi&logoColor=white)
![EV](https://img.shields.io/badge/EV-Ready-b4ffd9?style=for-the-badge&logo=tesla&logoColor=black)

### ⚡ Mobile-First Citizen & EV Driver Digital Vehicle Portal
**for the National E-Mobility Ecosystem**

</div>

---

## 📱 Key Features

| | Feature | Description |
|---|---|---|
| 🚗 | **Digital Vehicle Wallet** | QR Code Revenue License, always in your pocket |
| 💳 | **Traffic Fines** | Real-time fines with evidence snapshot view |
| ⚖️ | **Disputes & Payments** | Online dispute submission and digital fine payment |
| ⚡ | **Charging Station Locator** | Live plugs, power & pricing |
| 🔋 | **Battery Telemetry** | SoC monitoring and range estimates |

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

---

## 🌐 Connected Architecture

```mermaid
flowchart LR
    A[📱 Vehicle Portal<br/>:3000] -->|REST| B[🧠 E-Mobility Shared Backend API<br/>:5000/api]
    B --> C[(🗄️ Database)]
    B --> D[⚡ Charging Stations]
    B --> E[🚦 Traffic Fines]
```

- **Backend API:** Connects to the E-Mobility Shared Backend API on `http://localhost:5000/api`

---

<div align="center">
Made with ⚡ for a greener, smarter Sri Lanka
</div>
