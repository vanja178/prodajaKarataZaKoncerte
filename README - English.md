# Concert Ticket Sales System
## Application Description
The Concert Ticket Sales System is a modern, distributed web application based on an **event-driven architecture**, intended for concert customers and administrators. It consists of two fully independent applications that communicate exclusively through the RabbitMQ message broker, without sharing a database:

- **A.1 – Ticket reservation application** (customers and administrators): browsing concerts by category, reserving tickets with a choice of seating region and number of seats, applying a 10% time-based discount and a 5% promo code, converting the price into the selected currency (ExchangeRate API integration), and modifying or cancelling reservations using a unique code.
- **A.2 – Reporting portal** (administrators): real-time insight into the number of tickets sold and revenue per concert and location.

The key characteristic is the **asynchronous processing of reservations**: the customer immediately receives a reservation code and a promo code, while the capacity check and the ticket insert into the database happen in the background through a RabbitMQ queue. Frequently requested data (the concert list) is cached in **Redis**. The system was designed using the **FON Labis** methodology.

*The project was developed as part of the bachelor thesis "Development of a Software System for Concert Ticket Sales" (Faculty of Organizational Sciences, University of Belgrade).*

---
## Technologies
| Category | Technologies |
|---|---|
| Backend A.1 | Java 21, Spring Boot 4.0 (Spring Web, Spring Data JPA, Spring Data Redis, Spring AMQP), Hibernate, Lombok |
| Backend A.2 | Java 17, Spring Boot 3.5 |
| Frontend | Next.js 16 (Turbopack), TypeScript, Tailwind CSS, Node.js |
| Database | MySQL (`concert` and `izvestavanje` databases) |
| Caching | Redis (10-minute TTL) |
| Message broker | RabbitMQ (AMQP) |
| API Integrations | ExchangeRate API |
| Tools | Maven (Maven Wrapper), Git/GitHub, XAMPP, WSL, IntelliJ IDEA, VS Code, Thunder Client, SQLyog |

---
## Architecture
The system is organized into four layers:

| Layer | Description |
|---|---|
| Frontend | Two Next.js applications: ticket reservation (port `3000`) and reporting portal (port `3001`). |
| Backend (API) | Spring Boot REST controllers; validation, capacity checks and sending messages to RabbitMQ. |
| Background processing | `TicketCreateListener` (A.1) processes reservations, `TicketEventListener` (A.2) updates statistics. |
| Data | Two separate MySQL databases + Redis cache. |

### RabbitMQ Queues
| Queue | Description |
|---|---|
| `ticket-create` | Receives ticket reservation requests and forwards them to `TicketCreateListener` for processing. |
| `ticket-events` | Notifies the reporting portal about ticket state changes (`TICKET_CREATED`, `TICKET_UPDATED`, `TICKET_CANCELLED`). |

### Databases
| Database | Contents |
|---|---|
| `concert` | Transactional data of the reservation system (concerts, tickets, prices, discounts, promo codes). |
| `izvestavanje` | Aggregated data of the reporting portal. |

---
## Key Features
| Feature | Description |
|---|---|
| Concert catalog | Browse concerts grouped by category (genre). |
| Ticket reservation | Choose seating region and number of seats; the reservation code and promo code are returned immediately. |
| Discounts | 10% time-based discount (`DiscountPeriod`) and 5% promo code (a new one is issued after every reservation). |
| Currency conversion | The price is converted from Serbian dinars into the selected currency via the ExchangeRate API. |
| Modification and cancellation | Tickets are accessed using a unique 8-character code. Ticket statuses: `ACTIVE`, `CANCELLED`. |
| Promo code | Statuses: `ACTIVE` → `USED` / `INVALID` (after the reservation is cancelled). |
| Administration | Entry of locations, seating regions, categories, concerts, prices, currencies and discounts. |
| Analytics | The portal shows sales per concert and location in real time. |
| Caching | The concert list is cached in Redis (`@Cacheable`) and the cache is invalidated when concerts change (`@CacheEvict`). |

---
## Prerequisites
- Java 21 (A.1) and Java 17 (A.2)
- Node.js and npm
- MySQL server (e.g. XAMPP)
- Redis and RabbitMQ (on Windows, run through WSL)
- Git

---
## Running Locally
### 1. Clone the repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd <project-name>
```

### 2. Database
Start the MySQL server (XAMPP) and create two databases:
```sql
CREATE DATABASE concert;
CREATE DATABASE izvestavanje;
```
The schema is managed by the Hibernate ORM based on annotations on the Java entity classes. In the `application.properties` files of both backends, configure the connection (`url`, `username`, `password`).

### 3. Redis and RabbitMQ (WSL)
```bash
# Start Redis
sudo service redis-server start

# Start RabbitMQ
sudo service rabbitmq-server start
```

### 4. Backend A.1 (ticket reservation)
```bash
cd <backend-a1>
./mvnw spring-boot:run
```

### 5. Backend A.2 (reporting portal)
```bash
cd <backend-a2>
./mvnw spring-boot:run
```

### 6. Frontend applications
Open two additional terminals:
```bash
# Terminal 1 — Ticket reservation application (port 3000)
cd <frontend-reservation>
npm install
npm run dev

# Terminal 2 — Reporting portal (port 3001)
cd <frontend-reporting>
npm install
npm run dev
```

### 7. Accessing the application
| Service | URL |
|---|---|
| Ticket reservation application | http://localhost:3000 |
| Reporting portal | http://localhost:3001 |

> Startup order: MySQL → Redis and RabbitMQ → backend services → frontend applications.

---
## Author
| Name | Student ID | Mentor |
|---|---|---|
| Vanja Antin | 2022/0335 | Prof. Dr. Slađan Babarogić |
