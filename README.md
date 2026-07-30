 # StaySync

StaySync is a full-stack availability and pricing manager built as part of the PropertyFlow Full Stack Engineer take-home assignment.

The application manages a single vacation rental and provides an easy way to manage bookings, availability, pricing, and reservation imports while preventing double bookings.

-----------------------------------------------------------------------------------------------------------------------------

# Features

### Calendar

* Monthly availability calendar
* Daily booking status (Available, Booked, Blocked)
* Nightly pricing display
* Date range selection for actions

### Booking Management

* Create manual bookings
* Prevent overlapping bookings
* Prevent bookings on blocked dates
* Exclusive checkout support (checkout date remains available)

### Availability

* Block selected date ranges
* Unblock previously blocked dates
* Calendar updates immediately after changes

### Pricing

* Base nightly rate
* Manual rate overrides
* Automatic weekend pricing
* Seasonal pricing for December
* Manual overrides always take priority over calculated rates

### Reservation Import

Import reservations from the provided `reservations.json` file.

The import process handles:

* Duplicate reservations
* Cancelled reservations
* Booking conflicts
* Safe repeated imports without creating duplicate records

-----------------------------------------------------------------------------------------------------------------------------

# Tech Stack

## Frontend

* Angular 20
* Angular Material
* TypeScript
* Axios

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* SQLite

-----------------------------------------------------------------------------------------------------------------------------

# Project Structure

The backend follows a layered architecture to keep business logic separate from database access.

Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
SQLite

The frontend communicates with the backend through a single API service built with Axios.

-----------------------------------------------------------------------------------------------------------------------------

# API Endpoints
 Method   Endpoint      Description                                 
 
 GET     `/property`   Get property information                    
 GET     `/calendar`   Get calendar availability and nightly rates 
 GET     `/bookings`   Get all bookings                            
 POST    `/bookings`   Create a booking                            
 POST    `/rates`      Create or update rate overrides             
 POST    `/block`      Block a date range                          
 DELETE  `/block`      Remove blocked dates                        
 POST    `/import`     Import reservations                         

-----------------------------------------------------------------------------------------------------------------------------

# Database

The application uses SQLite with Prisma ORM.

Main entities:

* Property
* Booking
* BlockedDate
* RateOverride

-----------------------------------------------------------------------------------------------------------------------------

# Business Rules

### Availability

* Bookings cannot overlap existing bookings.
* Bookings cannot overlap blocked dates.
* Checkout dates are treated as exclusive, allowing another booking to start on the same day.

### Pricing

Nightly rates are calculated using:

* Base property rate
* Weekend pricing
* December seasonal pricing
* Manual rate overrides (highest priority)

### Reservation Import

The reservation import process:

* Skips duplicate reservations
* Detects conflicting reservations
* Can be safely executed multiple times without creating duplicate bookings

-----------------------------------------------------------------------------------------------------------------------------

# Design Decisions

Some decisions made during development:

* SQLite keeps the project simple to set up and run locally.
* Prisma ORM provides type saafe database access.
* Repository pattern keeps database logic separate from business logic.
* Business validation is handled in the service layer.
* Angular Material is used for a consistent user interface.
* date fns is used for date calculations.

-----------------------------------------------------------------------------------------------------------------------------

# Trade-offs

To keep the assignment focused and deliver a complete, working solution within the available time, I prioritised the core booking and availability workflow over additional production-level features.

As a result:

* SQLite was chosen instead of a production database such as PostgreSQL to simplify setup and local execution.
* The application currently supports a single property, allowing more focus on booking validation, pricing, and reservation imports.
* Authentication and user management were intentionally excluded.
* Payment processing and real OTA integrations (Airbnb, Booking.com, etc.) were not implemented.
* Automated tests and advanced calendar interactions (such as drag-and-drop editing) were left out to prioritise the core functionality.

-----------------------------------------------------------------------------------------------------------------------------

# Future Improvements

Given more time, the project could be extended with:

* Authentication and authorization
* Multi property support
* Automated tests
* Real OTA integrations
* Advanced pricing rules
* Minimum stay restrictions
* Deployment
* Drag-and-drop calendar interactions

-----------------------------------------------------------------------------------------------------------------------------

# Running the Project

## Backend

```bash
cd server

npm install

Create a `.env` file by copying `.env.example`.

npx prisma migrate dev

npm run seed

npm start
```

## Frontend


cd client

npm install

npm start


-----------------------------------------------------------------------------------------------------------------------------

# Notes

The main focus of this project was implementing reliable availability management with clean application architecture.

Special attention was given to:

* Preventing double bookings
* Handling exclusive checkout correctly
* Managing reservation imports safely
* Keeping the code modular and easy to maintain
* Separating business logic from database operations
