# Library Management – UI

React 19 + Vite, MUI components, React Router, axios.

## Run
1. Start the API (`LibraryManagment_API`, "https" profile → https://localhost:7221).
2. In this folder:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

`/api` calls are proxied to the API (see `.env` → `VITE_API_PROXY_TARGET`), so no CORS setup is needed.

Admin login: the `AdminSeed` mobile/password from the API's `appsettings.Development.json`.

## Pages
| URL | Who | What |
|---|---|---|
| `/` | everyone | Home page (placeholder until the home page builder) |
| `/seats` | everyone | Seat map per section: green = free, red = booked, grey = disabled, blue = yours |
| `/login`, `/register` | visitors | Mobile + password login; registration with name, mobile, password, gender, address |
| `/checkout/:bookingId` | student | 7-minute countdown, pay (mock dialog or Razorpay UPI), cancel hold |
| `/my-seat` | student | The student's seat, start date and next due date |
| `/admin/sections` | admin | Create / edit / delete Boys and Girls sections |
| `/admin/sections/:id` | admin | Drag-and-drop seat designer: add seats or a grid, move, rotate, disable, remove, save |
| `/admin/bookings` | admin | Students on seats: search, move a student to another seat, release a seat |

Payments: with `Payment:Provider = "Mock"` in the API a test payment dialog appears (Simulate success / failure).
With `"Razorpay"` the real Razorpay Checkout opens (UPI is shown when enabled on the Razorpay account).

## Structure
```
src/api/          axios client (adds the token, refreshes it on 401) and one function per endpoint
src/auth/         login session (localStorage) and useAuth()
src/components/   layouts, route guard, seat map drawing (seats/)
src/pages/        public pages; pages/admin/ for the admin area
```
