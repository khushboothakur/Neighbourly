# Running Neighbourly in the Browser (Chrome / Web)

This guide provides step-by-step instructions for running and testing the **Neighbourly** society management mobile application directly in your web browser (Google Chrome, Edge, Brave, etc.) without needing an Android emulator or physical device.

---

## Why Run in the Browser?

- **Instant Startup**: Avoids lengthy native Gradle compilation and Android emulator boot time.
- **Instant Hot-Reloading**: Code updates in React Native / Expo reflect in milliseconds.
- **Multi-Role Testing Side-by-Side**: Open a normal Chrome window for a **Resident** and an Incognito window (`Ctrl + Shift + N`) for the **Security Guard / Watchman** to test gate admissions, visitor passes, and approvals in real-time.

---

## 1. Prerequisites

1. **Node.js**: v18+ (v20+ recommended)
2. **Docker Desktop**: Running (used for the FastAPI backend and PostgreSQL database)
3. **Google Chrome** or any Chromium-based browser

---

## 2. Start the Backend Services

Ensure the backend API and database containers are up and running:

```powershell
# From the repository root (d:\OMNAMASHSHIVAYE\ojojo\new sero)
docker compose --profile local-db up -d
```

Verify the backend is active:
- Backend API URL: [http://localhost:8000](http://localhost:8000)
- OpenAPI / Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Launch the Web Application

Navigate into the `mobile` directory and run Expo in web mode:

```powershell
cd mobile

# Start Metro Bundler in web mode on port 8081
npx expo start --web --port 8081
```

Once started, open your browser to:
👉 **[http://localhost:8081](http://localhost:8081)**

> [!TIP]
> If port `8081` is already in use by another Metro or Node process, terminate the old process or specify another port, e.g. `npx expo start --web --port 8082`.

---

## 4. Test Accounts & Login Credentials

All seeded demo accounts in the database use a fixed OTP: **`123456`**.

| Role | Name | Mobile Number (+91) | Fixed OTP | Default Screen |
| :--- | :--- | :--- | :--- | :--- |
| **Security Guard (Main Gate)** | Ramesh Singh | **`9876543211`** | **`123456`** | Guard Dashboard (`/guard`) |
| **Security Guard (Service Gate)** | Bahadur Thapa | **`9876543212`** | **`123456`** | Guard Dashboard (`/guard`) |
| **Society Secretary (Owner)** | Arjun Sharma | **`9876543210`** | **`123456`** | Resident Home / Admin |
| **Society Admin (President)** | Vikram Malhotra | **`9876543201`** | **`123456`** | Admin Dashboard (`/admin`) |
| **Society Treasurer (Finance)** | Pooja Iyer | **`9876543202`** | **`123456`** | Finance Dashboard |
| **Flat Owner** | Sunil Kulkarni | **`9876543203`** | **`123456`** | Resident Home (`/`) |
| **Flat Tenant** | Neha Kapoor | **`9876543204`** | **`123456`** | Resident Home (`/`) |

---

## 5. End-to-End Walkthrough: Resident Invitation & Guard Admission

To test the entire visitor lifecycle side-by-side:

### Step A: Resident Creates an Invitation Pass (Normal Browser Window)
1. Open [http://localhost:8081](http://localhost:8081) in Chrome.
2. Sign in as a Resident:
   - Phone: **`9876543210`**
   - OTP: **`123456`**
3. Tap the **Visitors** tab in the bottom bar.
4. Tap **+ Invite Visitor** (`/visitors/invite`).
5. Enter visitor details:
   - **Visitor Name**: e.g. `Khusboo Singh`
   - **Mobile**: `9876543210`
   - **Date & Hours**: Set your desired visit hours today.
6. Click **Create Invitation**.
7. An entry pass is generated with a **QR code** and a **6-digit Entry PIN** (e.g. `723969`).

### Step B: Watchman Sees the Visitor and Admits Them (Incognito Window)
1. In Chrome, press **`Ctrl + Shift + N`** to open an **Incognito Window**.
2. Navigate to [http://localhost:8081](http://localhost:8081).
3. Sign in as the Guard:
   - Phone: **`9876543211`**
   - OTP: **`123456`**
4. You will land directly on the **Guard Dashboard** (`/guard`).
5. Notice the **Pre-Approved Visitors** section:
   - The visitor you just invited appears **automatically in real-time** (polled every 3 seconds).
   - Shows the visitor name, destination flat, host resident, and PIN.
6. Click the green **"Admit Guest"** button on the card.
7. The guest is immediately checked in and moved into the **Visitors Inside** list!
8. When the visitor leaves the society, the guard simply clicks **"Mark Exit"**.

---

## 6. Testing Walk-in Gate Approvals

1. In the **Guard Dashboard**, click **"Log Walk-in Entry"**.
2. Search and select the destination unit (e.g. `Tower A - 1204`).
3. Choose the category (**Guest**, **Delivery**, **Cab**, or **Service**) and fill in visitor details.
4. Tap **"Request Resident Approval"**.
5. Switch to the resident window:
   - The resident receives an alert to **Allow** or **Deny** entry.
6. Once the resident allows the visit, the guard's **Visitor approvals** section updates to show **"Record Entry"**.

---

## 7. Troubleshooting

### Port 8081 is Busy
If Expo outputs `› Port 8081 is being used by another process`:
```powershell
# Find and stop the process holding port 8081
Get-NetTCPConnection -LocalPort 8081 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```
Or start Expo on port 8082:
```powershell
npx expo start --web --port 8082
```

### "Choose a future visit time"
- If creating an invitation for today, ensure the **End time** is later than the current time. The system automatically adjusts start times earlier in the day to start immediately.

### Network / API Not Connected
- Ensure the backend container is healthy:
  ```powershell
  docker ps
  ```
- Check `.env` in `mobile/`:
  ```env
  EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
  ```
