# UKCAAR Backend — Driver APIs

**Base URL**

- `{{HOST}}/v1/api`

**Auth**

- For protected routes: `Authorization: Bearer {{DRIVER_TOKEN}}`

**Standard Response**

```json
{ "code": 1, "message": "success", "data": {} }
```

---

## Auth

### POST `/driver/send-otp`

**Body (JSON)**

```json
{ "mobile": "9999999999" }
```

### POST `/driver/verify-otp`

**Body (JSON)**

```json
{ "mobile": "9999999999", "otp": "123456" }
```

**Returns**

- `data.user`
- `data.token` (use as `{{DRIVER_TOKEN}}`)

---

## Profile & Documents (Protected)

### PUT `/driver/update-profile`

**Body (multipart/form-data)** (all optional)

- `fullname` (text)
- `mobile` (text)
- `email` (text)
- `ridepreference` (`Instant|Private|Schedule`)
- `address` (text)
- `dateOfBirth` (text/date)
- `profilePhoto` (file)

### GET `/driver/get-driver-details`

No body.

### PUT `/driver/update-vehicle-details`

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

### PUT `/driver/update-bank-details`

**Body (multipart/form-data)** (all optional)

- `accountHolderName` (text)
- `bankName` (text)
- `accountNumber` (text)
- `ifscCode` (text)
- `branchName` (text)
- `passbookfile` (file)

### PUT `/driver/update-driving-license-details`

**Body (multipart/form-data)** (all optional)

- `drivingLicenseNumber` (text)
- `expiryDate` (text/date)
- `licenseImage` (file)

### PUT `/driver/update-driving-rc-details`

**Body (multipart/form-data)** (all optional)

- `rcExpiryDate` (text/date)
- `rcImage` (file)

### PUT `/driver/update-status`

**Body (JSON)**

```json
{ "status": "Active" }
```

---

## Location (Protected)

### POST `/driver/update-location`

**Body (JSON)**

```json
{ "latitude": 28.6139, "longitude": 77.209 }
```

---

## Ride Requests & Ride Lifecycle (Protected)

### GET `/driver/ride-requests`

**Query (optional)**

- `page`, `limit`
- `latitude`, `longitude` (to enable nearby search)
- `maxDistanceMeters` (default `5000`)
- `includeScheduled=1`

### POST `/driver/accept-ride`

**Body (JSON)**

```json
{ "rideId": "RID_OBJECT_ID" }
```

### POST `/driver/reject-ride`

**Body (JSON)**

```json
{ "rideId": "RID_OBJECT_ID" }
```

### GET `/driver/current-ride`

No body.

### POST `/driver/arrive-pickup`

**Body (JSON)**

```json
{ "rideId": "RID_OBJECT_ID" }
```

### POST `/driver/verify-pickup-otp`

**Body (JSON)**

```json
{ "rideId": "RID_OBJECT_ID", "otp": "1234" }
```

### POST `/driver/start-ride`

**Body (JSON)**

```json
{ "rideId": "RID_OBJECT_ID", "otp": "1234" }
```

### POST `/driver/complete-ride`

**Body (JSON)**

```json
{
  "rideId": "RID_OBJECT_ID",
  "fare": 581,
  "distanceKm": 8.41,
  "durationMin": 28.5
}
```

---

## Journeys (Scheduled / Past / Completed) (Protected)

### GET `/driver/journeys`

**Query (optional)**

- `category=scheduled|upcoming|past|completed|all`
- `status` (override; comma separated)
- `page`, `limit`

### GET `/driver/journeys/:rideId`

**Params**

- `rideId` = Ride `_id`

---

## History & Earnings (Protected)

### GET `/driver/get-scheduled-rides`

No body.

### GET `/driver/ride-history`

**Query (optional)**

- `page`, `limit`
- `status`

### GET `/driver/earnings-summary`

**Query (optional)**

- `startDate` (ISO)
- `endDate` (ISO)
- `timezone` (default `UTC`)

---

## Reviews (Protected)

### GET `/driver/reviews`

**Query (optional)**

- `page`, `limit`
- `rating` (1..5)

### GET `/driver/rating-summary`

No body.

---

## Wallet / Cashout (Protected)

### GET `/driver/wallet-summary`

No body.

### GET `/driver/wallet-history`

**Query (optional)**

- `kind=all|rides|cashouts`
- `page`, `limit`

### POST `/driver/cashout-request`

**Body (JSON)**

```json
{ "amount": 500, "note": "Weekly withdrawal" }
```

### GET `/driver/cashout-history`

**Query (optional)**

- `status=Pending|Approved|Rejected|Paid|Cancelled`
- `page`, `limit`

### POST `/driver/cancel-cashout`

**Body (JSON)**

```json
{ "cashoutId": "CASHOUT_OBJECT_ID" }
```

---

## SOS (Protected)

### POST `/driver/emergency-sos`

**Body (JSON)** (all optional)

```json
{
  "rideId": "RID_OBJECT_ID",
  "message": "Emergency",
  "latitude": 28.6139,
  "longitude": 77.209
}
```

---

## User Ride APIs (Driver related)

### POST `/ride/accept-ride` (Protected)

**Body (JSON)**

```json
{ "rideId": "RID_OBJECT_ID", "driverId": "DRIVER_OBJECT_ID" }
```

## Admin-ish (Protected)

### GET `/driver/get-all-drivers`

**Query (optional)**

- `page`, `limit`
