# Security Specification: SaaS Gimnasios PHP (Firestore Edition)

## 1. Data Invariants

1. **Gym ID Integrity**: A Client record, ClassSession, or ProductInventory cannot exist without a valid references to an existing Gym ID.
2. **Access Isolation**: Standard read/write access is permitted for administrators of the particular Sede (or clients accessing their own assigned Sede data).
3. **Immutability of Sede ID**: Once registered inside a sub-tenant, a user or product cannot be silent-reassigned to another Sede ID without authorization.
4. **Verified Transactions**: Clients can only reserve session spots and buy products if their membership status is `Activo` and verification flags are true.

---

## 2. The "Dirty Dozen" (Malicious payloads designed to bypass rules)

1. **Identity Spoofing**: Changing the email address of a user in standard client session to mimic Super Admin.
2. **Gym Switching**: Client updating `gymId` to steal membership benefits from a high-tier Gym.
3. **Invalid Capacity Peak**: Booking a reservation when `currentReservations >= maxCapacity`.
4. **Junk Character Sede ID**: Trying to write a document with a 2MB binary string as ID to crash the Firestore indexing.
5. **No Auth Gym Sede Registration**: An unauthenticated user creating a new Sede entry.
6. **Price Dilution**: Updating `ProductInventory.price` on client side to buy high-end proteins/vitamins for $0.00.
7. **Negative Stock Insertion**: Updating product inventory with negative stock or negative price values.
8. **Bypassing Membership Expiration**: A client updating their `membershipEnd` date straight to 2030 to avoid renewal fees.
9. **Spamming System Logs**: Authenticated clients injecting thousands of false console logs (`LogEntry`) to exhaust server compute resource.
10. **Manipulating Backups DB**: Client updating or deleting backup records to hide database actions.
11. **Immoral Fields Injection**: Adding custom shadow fields (`isAdmin: true`) during normal registration.
12. **Tampering with Server Timestamps**: Providing custom old timestamps like `createdAt = 2001` instead of using Firebase server values.

---

## 3. Test Runner Specification

```typescript
// firestore.rules.test.ts
// Synthesized unit tests validating that each Dirty Dozen payload fails with PERMISSION_DENIED.
// Tested using @firebase/rules-unit-testing.
```
