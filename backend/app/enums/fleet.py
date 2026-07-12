import enum

class VehicleStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    IN_SHOP = "IN_SHOP"
    RETIRED = "RETIRED"

class DriverStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    OFF_DUTY = "OFF_DUTY"
    SUSPENDED = "SUSPENDED"

class TripStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class MaintenanceStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class MaintenanceType(str, enum.Enum):
    OIL_CHANGE = "Oil Change"
    ENGINE_SERVICE = "Engine Service"
    BRAKE_SERVICE = "Brake Service"
    TYRE_REPLACEMENT = "Tyre Replacement"
    BATTERY_REPLACEMENT = "Battery Replacement"
    INSPECTION = "Inspection"
    INSURANCE = "Insurance"
    REGISTRATION = "Registration"
    ACCIDENT_REPAIR = "Accident Repair"
    BODY_WORK = "Body Work"
    ELECTRICAL = "Electrical"
    TRANSMISSION = "Transmission"
    OTHER = "Other"

class MaintenancePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ExpenseType(str, enum.Enum):
    TOLL = "TOLL"
    PARKING = "PARKING"
    REPAIR = "REPAIR"
    MAINTENANCE = "MAINTENANCE"
    FUEL = "FUEL"
    OTHER = "OTHER"
