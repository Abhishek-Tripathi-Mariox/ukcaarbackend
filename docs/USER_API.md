# UKCAAR Backend — User APIs

**Base URL**

- `{{HOST}}/v1/api`

**Auth**

- For protected routes: `Authorization: Bearer {{USER_TOKEN}}`

**Standard Response**

```json
{ "code": 1, "message": "success", "data": {} }
```

---

## Auth

### POST `/user/send-otp`

**Body (JSON)**

```json
{ "mobile": "9999999999" }
```

### POST `/user/verify-otp`

**Body (JSON)**

```json
{ "mobile": "9999999999", "otp": "123456" }
```

**Returns**

- `data.user`
- `data.token` (use as `{{USER_TOKEN}}`)

---

## Profile

### PUT `/user/update-profile` (Protected)

**Body (JSON)** (all optional)

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "address": "Somewhere",
  "zipCode": "110001",
  "state": "Delhi",
  "latitude": 28.6139,
  "longitude": 77.209
}
```

### PUT `/user/notification-settings` (Protected)

**Body (JSON)** (any one optional)

```json
{ "pushNotification": true, "promotionalNotification": false }
```

### GET `/user/user-details` (Protected)

No body.

### POST `/user/apply-referral-code` (Protected)

**Body (JSON)**

```json
{ "referralCode": "REFABC123" }
```

---

## Address

### POST `/user/add-address` (Protected)

**Body (JSON)**

```json
{
  "city": "New Delhi",
  "state": "Delhi",
  "zipCode": "110001",
  "houseNo": "123",
  "landmark": "Near Metro",
  "email": "john@example.com",
  "fullName": "John Doe",
  "addressType": "Home"
}
```

### GET `/user/get-addresses` (Protected)

No body.

### PUT `/user/update-address/:id` (Protected)

**Params**

- `id` = Address `_id`

**Body (JSON)** (any fields)

```json
{
  "city": "New Delhi",
  "state": "Delhi",
  "zipCode": "110001",
  "houseNo": "123",
  "landmark": "Near Metro",
  "customerInstructions": "Call on arrival",
  "email": "john@example.com",
  "fullName": "John Doe",
  "addressType": "Home"
}
```

### DELETE `/user/delete-address/:id` (Protected)

**Params**

- `id` = Address `_id`

---

## Payment Methods

### POST `/user/add-payment-method` (Protected)

**Body (JSON)**

```json
{
  "cardName": "VISA",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/30",
  "cvc": "123",
  "zipCode": "110001"
}
```

### GET `/user/get-payment-methods` (Protected)

No body.

---

## Rider (Family Members)

### POST `/user/register-rider` (Protected)

**Body (JSON)**

```json
{
  "fullname": "Jane Doe",
  "mobile": "9999999999",
  "gender": "Female",
  "age": 25
}
```

### GET `/user/get-rider` (Protected)

No body.

---

## Rides

### POST `/ride/book-ride` (Protected)

**Body (JSON)**

```json
{
  "pickupLatitude": 28.6139,
  "pickupLongitude": 77.209,
  "dropoffLatitude": 28.5355,
  "dropoffLongitude": 77.391,
  "rideType": "Economy"
}
```

### GET `/ride/fare-estimate` (Protected)

**Query**

- `pickupLatitude`, `pickupLongitude`
- `dropoffLatitude`, `dropoffLongitude`
- `rideType` (optional: `Economy|Comfort|Premium`)

### GET `/ride/available-drivers` (Protected)

**Query**

- `latitude`, `longitude`
- `maxDistanceMeters` (optional, default `5000`)

### GET `/ride/current-ride` (Protected)

No body.

### GET `/ride/ride-details/:rideId` (Protected)

**Params**

- `rideId` = Ride `_id`

### POST `/ride/schedule-ride` (Protected)

**Body (JSON)**

```json
{
  "pickupLatitude": 28.6139,
  "pickupLongitude": 77.209,
  "dropoffLatitude": 28.5355,
  "dropoffLongitude": 77.391,
  "rideType": "Economy",
  "scheduledTime": "2026-03-17T10:00:00.000Z"
}
```

### GET `/ride/ride-history` (Protected)

**Query (optional)**

- `page` (default `1`)
- `limit` (default `10`)
- `status` (example: `requested`, `scheduled`, `completed`, `canceled`)

### POST `/ride/cancel-ride` (Protected)

**Body (JSON)**

```json
{
  "rideId": "RID_OBJECT_ID",
  "cancelReason": "Changed my mind",
  "canceledBy": "user"
}
```

### GET `/ride/receipt/:rideId` (Protected)

**Params**

- `rideId` = Ride `_id`

### POST `/ride/mark-paid` (Protected)

**Body (JSON)**

```json
{ "rideId": "RID_OBJECT_ID", "paymentMethodId": "PAYMENT_METHOD_ID", "paymentRef": "TXN123" }
```

### POST `/ride/emergency-sos` (Protected)

**Body (JSON)** (all optional)

```json
{
  "rideId": "RID_OBJECT_ID",
  "message": "Emergency",
  "latitude": 28.6139,
  "longitude": 77.209
}
```

### POST `/ride/submit-review` (Protected)

**Body (JSON)**

```json
{
  "rideId": "RID_OBJECT_ID",
  "rating": 5,
  "comment": "Great ride!"
}
```

---

## Legacy Aliases (Optional)

Some older app builds may call these alternative paths (same behavior/auth as the primary endpoints):

- Auth: `/user/sendOtp`, `/user/verifyOtp`, `/user/updateProfile`, `/user/profileDetails`
- Address: `/user/addAddress`, `/user/getAddress`, `/user/deleteAddress/:id`
- Payment: `/user/addPaymentMethod`, `/user/getPaymentMethod`
- Rider: `/user/createRider`, `/user/getRider`
- Rides: `/ride/BookRide`, `/ride/scheduleRide`, `/ride/cancelRide`, `/ride/acceptRide`
