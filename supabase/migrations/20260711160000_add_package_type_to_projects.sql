-- Add package_type column to projects table
ALTER TABLE projects
ADD COLUMN package_type TEXT DEFAULT 'other';

-- Add a check constraint to ensure only valid values
ALTER TABLE projects
ADD CONSTRAINT projects_package_type_check
CHECK (package_type IN ('starter', 'business', 'premium', 'other'));

-- Create an index for efficient filtering
CREATE INDEX idx_projects_package_type ON projects(package_type);

-- Update existing projects to have a default package_type of 'other'
UPDATE projects SET package_type = 'other' WHERE package_type IS NULL;
