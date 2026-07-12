-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES 
('Admin', 'Administrator with full access'), 
('Fleet Manager', 'Manages vehicles and trips'), 
('Driver', 'Vehicle operator'), 
('Safety Officer', 'Handles compliance and safety'), 
('Financial Analyst', 'Handles expenses and reporting');

-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Permissions table
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200),
    phone VARCHAR(50),
    avatar_url TEXT,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    employee_code VARCHAR(100) UNIQUE,
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Active, Suspended, Inactive
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    vin VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'Available', -- Available, On Trip, In Shop, Retired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Drivers table (Extension of users for driver-specific info)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Available', -- Available, On Trip, Off Duty, Suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Trips table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Dispatched, Completed, Cancelled
    distance_km DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Maintenance Logs table
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2),
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Open', -- Open, Closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Fuel Logs table
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    gallons DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Trip Status History
CREATE TABLE trip_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle Status History
CREATE TABLE vehicle_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver Status History
CREATE TABLE driver_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50), -- Alert, Info, Warning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    device TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
