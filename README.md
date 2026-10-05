# Sistem za prodaju karata za koncerte
## Opis aplikacije
Sistem za prodaju karata za koncerte je moderna, distribuirana web aplikacija zasnovana na **arhitekturi vođenoj događajima**, namenjena kupcima i administratorima koncerata. Sastoji se od dve potpuno nezavisne aplikacije koje komuniciraju isključivo putem RabbitMQ posrednika poruka, bez deljenja baze podataka:

- **A.1 – Aplikacija za rezervaciju karata** (kupci i administratori): pregled koncerata po kategorijama, rezervacija karata sa izborom regiona sedenja i količine mesta, primena vremenskog popusta od 10 % i promo koda sa popustom od 5 %, konverzija cene u odabranu valutu (integracija sa ExchangeRate API-jem), kao i izmena i otkazivanje rezervacija putem jedinstvene šifre.
- **A.2 – Portal za izveštavanje** (administratori): uvid u broj prodatih karata i prihod po koncertima i lokacijama u realnom vremenu.

Ključna karakteristika je **asinhrona obrada rezervacija**: kupac odmah dobija šifru rezervacije i promo kod, dok se provera kapaciteta i upis karte u bazu odvijaju u pozadini preko RabbitMQ reda. Često traženi podaci (lista koncerata) keširaju se u **Redis-u**. Sistem je projektovan prema **FON Labis** metodologiji.

*Projekat je izrađen u okviru završnog rada „Razvoj programskog sistema za prodaju karata za koncerte“ (FON, Univerzitet u Beogradu).*

---
## Tehnologije
| Kategorija | Tehnologije |
|---|---|
| Backend A.1 | Java 21, Spring Boot 4.0 (Spring Web, Spring Data JPA, Spring Data Redis, Spring AMQP), Hibernate, Lombok |
| Backend A.2 | Java 17, Spring Boot 3.5 |
| Frontend | Next.js 16 (Turbopack), TypeScript, Tailwind CSS, Node.js |
| Baza podataka | MySQL (baze `concert` i `izvestavanje`) |
| Keširanje | Redis (TTL 10 minuta) |
| Posrednik poruka | RabbitMQ (AMQP) |
| API Integracije | ExchangeRate API |
| Alati | Maven (Maven Wrapper), Git/GitHub, XAMPP, WSL, IntelliJ IDEA, VS Code, Thunder Client, SQLyog |

---
## Arhitektura
Sistem je organizovan kroz četiri sloja:

| Sloj | Opis |
|---|---|
| Frontend | Dve Next.js aplikacije: rezervacija karata (port `3000`) i portal za izveštavanje (port `3001`). |
| Backend (API) | Spring Boot REST kontroleri; validacija, provera kapaciteta i slanje poruka na RabbitMQ. |
| Pozadinska obrada | `TicketCreateListener` (A.1) obrađuje rezervacije, `TicketEventListener` (A.2) ažurira statistiku. |
| Podaci | Dve odvojene MySQL baze + Redis keš. |

### RabbitMQ redovi
| Red | Opis |
|---|---|
| `ticket-create` | Prima zahteve za rezervaciju karata i prosleđuje ih `TicketCreateListener`-u na obradu. |
| `ticket-events` | Obaveštava portal za izveštavanje o promenama stanja karata (`TICKET_CREATED`, `TICKET_UPDATED`, `TICKET_CANCELLED`). |

### Baze podataka
| Baza | Sadržaj |
|---|---|
| `concert` | Transakcioni podaci sistema za rezervaciju (koncerti, karte, cene, popusti, promo kodovi). |
| `izvestavanje` | Agregirani podaci portala za izveštavanje. |

---
## Ključne funkcionalnosti
| Funkcionalnost | Opis |
|---|---|
| Katalog koncerata | Pregled koncerata grupisanih po kategorijama (žanrovima). |
| Rezervacija karata | Izbor regiona sedenja i količine mesta; šifra rezervacije i promo kod se vraćaju odmah. |
| Popusti | Vremenski popust od 10 % (`DiscountPeriod`) i promo kod od 5 % (nakon svake rezervacije kupac dobija novi). |
| Konverzija valuta | Cena iz dinara se preračunava u odabranu valutu putem ExchangeRate API-ja. |
| Izmena i otkazivanje | Pristup karti preko jedinstvene 8-karakterne šifre. Statusi karte: `ACTIVE`, `CANCELLED`. |
| Promo kod | Statusi: `ACTIVE` → `USED` / `INVALID` (nakon otkazivanja rezervacije). |
| Administracija | Unos lokacija, regiona sedenja, kategorija, koncerata, cena, valuta i popusta. |
| Analitika | Portal prikazuje prodaju po koncertima i lokacijama u realnom vremenu. |
| Keširanje | Lista koncerata se kešira u Redis-u (`@Cacheable`), a keš se invalidira pri izmeni koncerata (`@CacheEvict`). |

---
## Preduslovi
- Java 21 (A.1) i Java 17 (A.2)
- Node.js i npm
- MySQL server (npr. XAMPP)
- Redis i RabbitMQ (na Windows-u se pokreću kroz WSL)
- Git

---
## Lokalno pokretanje
### 1. Kloniranje repozitorijuma
```bash
git clone <URL_VASEG_REPOZITORIJUMA>
cd <naziv-projekta>
```

### 2. Baza podataka
Pokrenite MySQL server (XAMPP) i kreirajte dve baze:
```sql
CREATE DATABASE concert;
CREATE DATABASE izvestavanje;
```
Šemom upravlja Hibernate ORM na osnovu anotacija na Java klasama entiteta. U `application.properties` fajlovima oba backend-a podesite konekciju (`url`, `username`, `password`).

### 3. Redis i RabbitMQ (WSL)
```bash
# Pokretanje Redis-a
sudo service redis-server start

# Pokretanje RabbitMQ-a
sudo service rabbitmq-server start
```

### 4. Backend A.1 (rezervacija karata)
```bash
cd <backend-a1>
./mvnw spring-boot:run
```

### 5. Backend A.2 (portal za izveštavanje)
```bash
cd <backend-a2>
./mvnw spring-boot:run
```

### 6. Frontend aplikacije
Otvorite dva dodatna terminala:
```bash
# Terminal 1 — Aplikacija za rezervaciju karata (port 3000)
cd <frontend-rezervacija>
npm install
npm run dev

# Terminal 2 — Portal za izveštavanje (port 3001)
cd <frontend-izvestavanje>
npm install
npm run dev
```

### 7. Pristup aplikaciji
| Servis | URL |
|---|---|
| Aplikacija za rezervaciju karata | http://localhost:3000 |
| Portal za izveštavanje | http://localhost:3001 |

> Redosled pokretanja: MySQL → Redis i RabbitMQ → backend servisi → frontend aplikacije.

---
## Autor
| Ime i prezime | Broj indeksa | Mentor |
|---|---|---|
| Vanja Antin | 2022/0335 | Prof. dr Slađan Babarogić |
