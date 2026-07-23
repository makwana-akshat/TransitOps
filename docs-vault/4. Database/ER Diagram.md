---
title: "ER Diagram"
aliases: ["Entity Relationship Diagram", "Database Graph"]
tags: ["#database", "#erd"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Entity-Relationship Diagram

This Mermaid diagram illustrates the relationships between the core database tables in TransitOps.

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string hashed_password
        string full_name
        timestamp created_at
    }
    
    VEHICLES {
        uuid id PK
        string registration_number
        string status
        float capacity_kg
        float current_odometer
        float acquisition_cost
        uuid created_by FK
    }
    
    DRIVERS {
        uuid id PK
        string name
        string license_number
        string status
        uuid user_id FK
    }
    
    TRIPS {
        uuid id PK
        uuid vehicle_id FK
        uuid driver_id FK
        string status
        float trip_revenue
        float actual_distance
        timestamp planned_start
        timestamp actual_end
    }
    
    FUEL_LOGS {
        uuid id PK
        uuid vehicle_id FK
        uuid driver_id FK
        float liters
        float total_cost
        timestamp filled_at
    }
    
    EXPENSES {
        uuid id PK
        uuid vehicle_id FK
        uuid trip_id FK
        string expense_type
        float amount
        timestamp expense_date
    }
    
    MAINTENANCE_RECORDS {
        uuid id PK
        uuid vehicle_id FK
        string maintenance_type
        float cost
        timestamp date_performed
    }

    USERS ||--o{ VEHICLES : "creates"
    USERS ||--o{ DRIVERS : "is/creates"
    VEHICLES ||--o{ TRIPS : "assigned to"
    DRIVERS ||--o{ TRIPS : "drives"
    VEHICLES ||--o{ FUEL_LOGS : "consumes"
    DRIVERS ||--o{ FUEL_LOGS : "logs"
    VEHICLES ||--o{ EXPENSES : "incurs"
    TRIPS ||--o{ EXPENSES : "incurs"
    VEHICLES ||--o{ MAINTENANCE_RECORDS : "undergoes"
```

## Key Relationships
- **Vehicles to Trips (1:N)**: A vehicle goes on many trips.
- **Drivers to Trips (1:N)**: A driver operates many trips.
- **Trips to Expenses (1:N)**: A trip can incur specific expenses (like Tolls). If an expense isn't tied to a trip, it might just be tied to the Vehicle.
