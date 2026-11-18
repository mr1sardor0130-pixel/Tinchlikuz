# Security Specification — Tinchlik Oilaviy Restorani

## 1. Data Invariants

1. **Super-Admin Bootstrap & Verified Identity**:
   - `mr1sardor0130@gmail.com` (with `request.auth.token.email_verified == true`) is the immutable super-admin.
   - Any delegated admin access requires BOTH a verified Google account (`email_verified == true`) AND an existing `/admins/{emailLower}` document with the required boolean permission (`canAccessPanel`, `canManageBookings`, `canManageAdmins`).
   - Super-admin record `mr1sardor0130@gmail.com` cannot be deleted by other admins.
2. **PII Isolation on Reservations & CRM**:
   - Guest reservations (`/reservations/{reservationId}`) and CRM records (`/customers/{customerId}`) contain guest PII (`name`, `phone`).
   - Unauthenticated users or non-admin signed-in users MUST NEVER be able to `get` or `list` `/reservations` or `/customers`.
3. **Strict Public Reservation Creation**:
   - Public guests may only `create` `/reservations/{reservationId}` with an initial `status == 'new'`, empty `adminNote == ''`, empty `handledByEmail == ''`, valid hall ID, bounded `guests` integer (`1..250`), bounded strings, exact key set (`hasAll` + `hasOnly`), and `createdAt == request.time && updatedAt == request.time`.
4. **Action-Based & Immutable Updates**:
   - `createdAt` is immutable on all updates across all collections.
   - `updatedAt` must always equal `request.time`.
   - Reservation updates are restricted to admins with `canManageBookings` and only allowed mutable fields (`status`, `adminNote`, `handledByEmail`, `hallId`, `hallTitle`, `date`, `time`, `guests`, `notes`, `updatedAt`).

## 2. The "Dirty Dozen" Attack Payloads

1. **Unverified Email Spoofing**: Signed-in token `{ email: 'mr1sardor0130@gmail.com', email_verified: false }` attempting `list /reservations` -> `PERMISSION_DENIED`.
2. **Unauthorized Admin Self-Promotion**: Signed-in non-admin user creating `/admins/attacker@gmail.com` with `{ canAccessPanel: true, canManageAdmins: true }` -> `PERMISSION_DENIED`.
3. **Panel-Only Admin Trying to Delete Bookings**: Admin with `{ canAccessPanel: true, canManageBookings: false }` attempting `delete /reservations/tn-1` -> `PERMISSION_DENIED`.
4. **Panel-Only Admin Trying to Add New Admin**: Admin with `{ canAccessPanel: true, canManageBookings: true, canManageAdmins: false }` creating `/admins/friend@gmail.com` -> `PERMISSION_DENIED`.
5. **Public PII Scrape**: Unauthenticated or ordinary Google user calling `get` or `list` on `/reservations` or `/customers` -> `PERMISSION_DENIED`.
6. **Public Status Injection on Create**: Public user creating `/reservations/tn-hack` with `status: 'confirmed'` instead of `'new'` -> `PERMISSION_DENIED`.
7. **Shadow Ghost Field Injection**: Creating a reservation containing extra field `isVipApproved: true` -> `PERMISSION_DENIED`.
8. **ID Poisoning**: Creating `/reservations/` with a 500-character or slash-containing ID or invalid pattern -> `PERMISSION_DENIED`.
9. **Denial of Wallet Payload**: Creating a reservation with `guests: 999999` or `notes` string of 10,000 characters -> `PERMISSION_DENIED`.
10. **Client Timestamp Tampering**: Creating a reservation or customer record with backdated `createdAt` (`!= request.time`) or modifying `createdAt` on update -> `PERMISSION_DENIED`.
11. **Admin Document Email Mismatch**: Creating `/admins/a@example.com` with `data.email == 'b@example.com'` -> `PERMISSION_DENIED`.
12. **Super-Admin Deletion Attack**: Delegated admin with `canManageAdmins: true` attempting to `delete /admins/mr1sardor0130@gmail.com` -> `PERMISSION_DENIED`.
