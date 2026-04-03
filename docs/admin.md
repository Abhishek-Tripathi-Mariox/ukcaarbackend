# UKCAAR Backend - Admin APIs

This document defines the admin-side API contract for the backend.

## Current backend state

- The codebase exposes `user`, `driver`, `ride`, and `admin` route groups.
- A dedicated `Admin` model, `AdminController`, admin auth middleware, and startup seeder are now in place.
- The admin flow below is the implemented admin contract under the protected `/admin` namespace.

## Base URL

- `{{HOST}}/v1/api`

## Admin token

- Protected routes should use: `Authorization: Bearer {{ADMIN_TOKEN}}`
- The JWT payload should contain `adminId`.

## Default admin seeder

The project should create a super admin automatically on startup if one does not already exist.

### Seeder behavior

- Runs during app start or database connection bootstrap.
- Checks whether a super admin already exists.
- If not found, creates one default admin record.
- Stores a hashed password only.
- Generates an admin email and password from environment variables.

### Suggested environment variables

```env
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@ukcaar.com
ADMIN_PASSWORD=Admin@123
ADMIN_PHONE=9999999999
ADMIN_ROLE=SuperAdmin
```

### Suggested startup flow

1. Start the app with `npm start` or `npm run dev` if a dev script exists.
2. Database connects.
3. Seeder creates the default admin if missing.
4. Admin logs in with the seeded credentials.
5. Admin changes password after first login.

> Note: `package.json` defines both `start` and `dev`, and both run `nodemon index.js`.

## Standard Response

```json
{ "code": 1, "message": "success", "data": {} }
```

---

## Auth

### POST `/admin/login`

Use this to sign in with the seeded admin credentials or any admin account.

**Body (JSON)**

```json
{
  "email": "admin@ukcaar.com",
  "password": "Admin@123"
}
```

**Returns**

- `data.admin`
- `data.token` use as `{{ADMIN_TOKEN}}`

---

### POST `/admin/forgot-password`

Starts password recovery for the admin account.

**Body (JSON)**

```json
{ "email": "admin@ukcaar.com" }
```

**Typical response**

- OTP or reset token sent to email or phone

---

### POST `/admin/verify-forgot-password-otp`

Verifies the OTP/reset code if the recovery flow uses OTP.

**Body (JSON)**

```json
{
  "email": "admin@ukcaar.com",
  "otp": "123456"
}
```

---

### POST `/admin/reset-password`

Resets the password after OTP or token verification.

**Body (JSON)**

```json
{
  "email": "admin@ukcaar.com",
  "otp": "123456",
  "newPassword": "NewAdmin@123"
}
```

---

### POST `/admin/change-password` (Protected)

Changes the current admin password while signed in.

**Body (JSON)**

```json
{
  "oldPassword": "Admin@123",
  "newPassword": "NewAdmin@123"
}
```

---

### GET `/admin/me` (Protected)

Returns the currently authenticated admin profile.

No body.

---

### POST `/admin/logout` (Protected)

Logs out the admin session.

**Body (JSON)**

```json
{ "token": "{{ADMIN_TOKEN}}" }
```

If JWT is used without server-side sessions, logout can be a client-side token discard.

---

## Dashboard

### GET `/admin/dashboard/summary` (Protected)

Returns high-level counts and metrics.

**Typical data**

- `totalUsers`
- `totalDrivers`
- `totalRides`
- `activeRides`
- `completedRides`
- `cancelledRides`
- `pendingDriverApprovals`
- `pendingCashouts`
- `totalRevenue`

No body.

---

### GET `/admin/dashboard/earnings` (Protected)

Returns earnings breakdown.

**Query (optional)**

- `startDate` ISO string
- `endDate` ISO string
- `timezone` default `UTC`

---

## Users

### GET `/admin/users` (Protected)

Lists all users with search and pagination.

**Query (optional)**

- `page`
- `limit`
- `search` name, mobile, email
- `sortBy` `createdAt|fullname|mobile`
- `order` `asc|desc`
- `status` if you later add block/unblock support

No body.

---

### GET `/admin/users/:id` (Protected)

Fetches a single user.

**Params**

- `id` = User `_id`

---

### PUT `/admin/users/:id` (Protected)

Updates user profile details.

**Body (JSON)** (all optional)

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "address": "Somewhere",
  "state": "Delhi",
  "zipCode": "110001",
  "pushNotification": true,
  "promotionalNotification": false
}
```

---

### PATCH `/admin/users/:id/status` (Protected)

Use this for block or unblock actions if you add account control.

**Body (JSON)**

```json
{ "status": "Active" }
```

Suggested values can be `Active` or `Blocked`.

---

## Drivers

### GET `/admin/drivers` (Protected)

Lists all drivers.

**Query (optional)**

- `page`
- `limit`
- `search`
- `approvalStatus` `Pending|Approved|Rejected`
- `status` `Active|Inactive`
- `ridepreference` `Instant|Private|Schedule`

---

### GET `/admin/drivers/:id` (Protected)

Returns driver details including vehicle, documents, bank details, and current status.

---

### PATCH `/admin/drivers/:id/approve` (Protected)

Approves a driver.

**Body (JSON)**

```json
{
  "approvalStatus": "Approved",
  "note": "Documents verified"
}
```

---

### PATCH `/admin/drivers/:id/reject` (Protected)

Rejects a driver application.

**Body (JSON)**

```json
{
  "approvalStatus": "Rejected",
  "reason": "Invalid documents"
}
```

---

### PATCH `/admin/drivers/:id/status` (Protected)

Updates driver online/offline style status.

**Body (JSON)**

```json
{ "status": "Active" }
```

---

### PUT `/admin/drivers/:id/profile` (Protected)

Updates profile information.

**Body (JSON)**

```json
{
  "fullname": "Driver Name",
  "mobile": "9999999999",
  "email": "driver@example.com",
  "ridepreference": "Instant",
  "address": "Delhi",
  "dateOfBirth": "1995-01-01"
}
```

---

### PUT `/admin/drivers/:id/vehicle` (Protected)

Updates vehicle details.

**Body (JSON)**

```json
{
  "vehicleType": "Sedan",
  "model": "Swift",
  "color": "White",
  "registrationNumber": "DL01AB1234",
  "manufacturingYear": 2022,
  "seatingCapacity": 4,
  "licenseNumber": "DL-1234",
  "insuranceNumber": "INS-456"
}
```

---

### PUT `/admin/drivers/:id/bank` (Protected)

Updates bank details.

**Body (JSON)**

```json
{
  "accountHolderName": "Driver Name",
  "bankName": "HDFC",
  "accountNumber": "1234567890",
  "ifscCode": "HDFC0001234",
  "branchName": "Connaught Place"
}
```

---

### PUT `/admin/drivers/:id/license` (Protected)

Updates driving license details.

**Body (JSON)**

```json
{
  "drivingLicenseNumber": "DL-1234567890123",
  "expiryDate": "2030-12-31"
}
```

Multipart form-data can be used if you upload `licenseImage`.

---

### PUT `/admin/drivers/:id/rc` (Protected)

Updates RC details.

**Body (JSON)**

```json
{ "rcExpiryDate": "2030-12-31" }
```

Multipart form-data can be used if you upload `rcImage`.

---

### GET `/admin/drivers/:id/reviews` (Protected)

Returns reviews received by the driver.

**Query (optional)**

- `page`
- `limit`
- `rating`

---

### GET `/admin/drivers/:id/wallet` (Protected)

Returns earnings and cashout summary.

No body.

---

### GET `/admin/drivers/:id/wallet-history` (Protected)

Returns ride and cashout history.

**Query (optional)**

- `kind=all|rides|cashouts`
- `page`
- `limit`

---

### GET `/admin/drivers/:id/cashouts` (Protected)

Returns cashout requests for one driver.

**Query (optional)**

- `status=Pending|Approved|Rejected|Paid|Cancelled`
- `page`
- `limit`

---

### PATCH `/admin/drivers/:id/ban` (Protected)

Optional admin control endpoint for disabling a driver account.

**Body (JSON)**

```json
{
  "status": "Inactive",
  "reason": "Policy violation"
}
```

---

## Rides

### GET `/admin/rides` (Protected)

Lists all rides.

**Query (optional)**

- `page`
- `limit`
- `status`
- `userId`
- `driverId`
- `rideType`
- `startDate`
- `endDate`

---

### GET `/admin/rides/:rideId` (Protected)

Returns ride details.

**Params**

- `rideId` = Ride `_id`

---

### PATCH `/admin/rides/:rideId/status` (Protected)

Updates ride status for operational support.

**Body (JSON)**

```json
{
  "status": "canceled",
  "canceledBy": "admin",
  "cancelReason": "Customer support cancellation"
}
```

Allowed ride statuses depend on your ride lifecycle.

---

### PATCH `/admin/rides/:rideId/assign-driver` (Protected)

Assigns a driver manually.

**Body (JSON)**

```json
{
  "driverId": "DRIVER_OBJECT_ID"
}
```

---

### PATCH `/admin/rides/:rideId/cancel` (Protected)

Cancels a ride from admin side.

**Body (JSON)**

```json
{
  "cancelReason": "Operational issue",
  "canceledBy": "admin"
}
```

---

## Cashouts

### GET `/admin/cashouts` (Protected)

Lists all cashout requests.

**Query (optional)**

- `page`
- `limit`
- `status`
- `driverId`

---

### GET `/admin/cashouts/:id` (Protected)

Returns one cashout request.

---

### PATCH `/admin/cashouts/:id/approve` (Protected)

Approves a cashout request.

**Body (JSON)**

```json
{
  "note": "Approved after verification"
}
```

---

### PATCH `/admin/cashouts/:id/reject` (Protected)

Rejects a cashout request.

**Body (JSON)**

```json
{
  "reason": "Bank details mismatch"
}
```

---

### PATCH `/admin/cashouts/:id/mark-paid` (Protected)

Marks the cashout as paid.

**Body (JSON)**

```json
{
  "referenceNumber": "UTR123456789"
}
```

---

## Reviews

### GET `/admin/reviews` (Protected)

Lists all reviews.

**Query (optional)**

- `page`
- `limit`
- `rating`
- `driverId`
- `userId`

---

### GET `/admin/reviews/:id` (Protected)

Returns a single review.

---

### DELETE `/admin/reviews/:id` (Protected)

Deletes a review if moderation is needed.

No body.

---

## Payments

### GET `/admin/payment-methods` (Protected)

Lists saved payment methods if you want admin visibility into user payment profiles.

**Query (optional)**

- `page`
- `limit`
- `userId`

---

## Suggested admin response shape

For all admin endpoints, use the same response wrapper as the rest of the API:

```json
{
  "code": 1,
  "message": "Admin login successful",
  "data": {
    "admin": {}
  }
}
```

## Implementation notes

- Keep admin routes separate from user and driver routes.
- Prefer a dedicated `Admin` model.
- Hash passwords with `bcrypt` or equivalent before storing.
- Seed only one super admin by default.
- After the first login, force a password change if desired.
- Protect all admin management routes with an admin JWT middleware.
