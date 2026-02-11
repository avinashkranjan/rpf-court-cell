#!/bin/bash

# =====================================================================
# RPF Court Cell - Storage Migration Helper Script
# Migrate files from Lovable Supabase Storage to Self-Hosted Supabase
# =====================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STORAGE_EXPORT_DIR="${SCRIPT_DIR}/storage_export"

echo "======================================================================"
echo "RPF Court Cell - Storage Migration Helper"
echo "======================================================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

# Check for required environment variables
if [ -z "$SOURCE_SUPABASE_URL" ] || [ -z "$SOURCE_SUPABASE_KEY" ]; then
    echo -e "${YELLOW}Warning: Source Supabase credentials not set${NC}"
    echo "Please set environment variables:"
    echo "  export SOURCE_SUPABASE_URL='https://xxxxx.supabase.co'"
    echo "  export SOURCE_SUPABASE_KEY='your-service-role-key'"
    echo ""
fi

if [ -z "$TARGET_SUPABASE_URL" ] || [ -z "$TARGET_SUPABASE_KEY" ]; then
    echo -e "${YELLOW}Warning: Target Supabase credentials not set${NC}"
    echo "Please set environment variables:"
    echo "  export TARGET_SUPABASE_URL='https://your-instance.com'"
    echo "  export TARGET_SUPABASE_KEY='your-service-role-key'"
    echo ""
fi

# Storage buckets to migrate
BUCKETS=(
    "case-documents"
    "accused-photos"
    "identity-proofs"
    "signatures"
    "seized-items"
    "medical-certificates"
)

# Function to create storage bucket
create_bucket() {
    local bucket_name=$1
    local is_public=${2:-false}
    
    echo -e "${YELLOW}Creating bucket: ${bucket_name}${NC}"
    
    # Note: This requires manual creation via Dashboard or API
    echo "  → Please create bucket '${bucket_name}' in target Supabase"
    echo "     Settings: Public=${is_public}, File size limit=50MB"
}

# Function to export storage bucket
export_bucket() {
    local bucket_name=$1
    local export_path="${STORAGE_EXPORT_DIR}/${bucket_name}"
    
    echo -e "${GREEN}Exporting bucket: ${bucket_name}${NC}"
    
    mkdir -p "$export_path"
    
    # This is a placeholder - actual implementation depends on Supabase CLI version
    # For now, users should download files manually via Dashboard
    echo "  → Manual download required from Lovable Supabase Dashboard"
    echo "     Storage > ${bucket_name} > Download all files to: ${export_path}"
}

# Function to import storage bucket
import_bucket() {
    local bucket_name=$1
    local import_path="${STORAGE_EXPORT_DIR}/${bucket_name}"
    
    echo -e "${GREEN}Importing bucket: ${bucket_name}${NC}"
    
    if [ ! -d "$import_path" ]; then
        echo -e "${RED}  → Error: Directory not found: ${import_path}${NC}"
        return 1
    fi
    
    file_count=$(find "$import_path" -type f | wc -l)
    echo "  → Found ${file_count} files to upload"
    
    # This is a placeholder - actual implementation depends on Supabase CLI version
    echo "  → Manual upload required to Self-Hosted Supabase Dashboard"
    echo "     Storage > ${bucket_name} > Upload files from: ${import_path}"
}

# Function to update file URLs in database
update_file_urls() {
    echo -e "${GREEN}Updating file URLs in database${NC}"
    
    # Note: This requires database connection and SQL updates
    cat << 'EOF'
-- SQL Script to update file URLs after storage migration
-- Run this in your target database after files are uploaded

-- Update accused photograph URLs
UPDATE accused 
SET photograph_url = REPLACE(
    photograph_url, 
    'SOURCE_STORAGE_URL', 
    'TARGET_STORAGE_URL'
)
WHERE photograph_url IS NOT NULL;

-- Update identity proof URLs
UPDATE accused 
SET identity_proof_url = REPLACE(
    identity_proof_url, 
    'SOURCE_STORAGE_URL', 
    'TARGET_STORAGE_URL'
)
WHERE identity_proof_url IS NOT NULL;

-- Update arrest memo PDFs
UPDATE arrest_memos 
SET pdf_url = REPLACE(
    pdf_url, 
    'SOURCE_STORAGE_URL', 
    'TARGET_STORAGE_URL'
)
WHERE pdf_url IS NOT NULL;

-- Update seizure memo PDFs
UPDATE seizure_memos 
SET pdf_url = REPLACE(
    pdf_url, 
    'SOURCE_STORAGE_URL', 
    'TARGET_STORAGE_URL'
)
WHERE pdf_url IS NOT NULL;

-- Update medical memo PDFs and certificates
UPDATE medical_memos 
SET 
    pdf_url = REPLACE(pdf_url, 'SOURCE_STORAGE_URL', 'TARGET_STORAGE_URL'),
    medical_certificate_url = REPLACE(medical_certificate_url, 'SOURCE_STORAGE_URL', 'TARGET_STORAGE_URL')
WHERE pdf_url IS NOT NULL OR medical_certificate_url IS NOT NULL;

-- Update court forwarding PDFs
UPDATE court_forwardings 
SET pdf_url = REPLACE(
    pdf_url, 
    'SOURCE_STORAGE_URL', 
    'TARGET_STORAGE_URL'
)
WHERE pdf_url IS NOT NULL;

-- Update accused challan PDFs
UPDATE accused_challans 
SET pdf_url = REPLACE(
    pdf_url, 
    'SOURCE_STORAGE_URL', 
    'TARGET_STORAGE_URL'
)
WHERE pdf_url IS NOT NULL;

-- Verify updates
SELECT 
    'accused_photos' as table_name,
    COUNT(*) as urls_updated
FROM accused 
WHERE photograph_url LIKE '%TARGET_STORAGE_URL%'
UNION ALL
SELECT 
    'arrest_memo_pdfs',
    COUNT(*)
FROM arrest_memos 
WHERE pdf_url LIKE '%TARGET_STORAGE_URL%'
UNION ALL
SELECT 
    'seizure_memo_pdfs',
    COUNT(*)
FROM seizure_memos 
WHERE pdf_url LIKE '%TARGET_STORAGE_URL%'
UNION ALL
SELECT 
    'medical_memo_pdfs',
    COUNT(*)
FROM medical_memos 
WHERE pdf_url LIKE '%TARGET_STORAGE_URL%';
EOF
}

# Main execution
main() {
    echo "Starting storage migration process..."
    echo ""
    
    # Create export directory
    mkdir -p "$STORAGE_EXPORT_DIR"
    
    # Menu
    echo "Select an option:"
    echo "  1) Create buckets in target Supabase"
    echo "  2) Export files from source Supabase"
    echo "  3) Import files to target Supabase"
    echo "  4) Generate URL update SQL script"
    echo "  5) Full migration (steps 1-4)"
    echo "  6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1)
            echo ""
            echo "Creating buckets..."
            for bucket in "${BUCKETS[@]}"; do
                create_bucket "$bucket"
            done
            ;;
        2)
            echo ""
            echo "Exporting files..."
            for bucket in "${BUCKETS[@]}"; do
                export_bucket "$bucket"
            done
            ;;
        3)
            echo ""
            echo "Importing files..."
            for bucket in "${BUCKETS[@]}"; do
                import_bucket "$bucket"
            done
            ;;
        4)
            echo ""
            update_file_urls > "${SCRIPT_DIR}/update_file_urls.sql"
            echo -e "${GREEN}SQL script generated: update_file_urls.sql${NC}"
            ;;
        5)
            echo ""
            echo "Running full migration..."
            for bucket in "${BUCKETS[@]}"; do
                create_bucket "$bucket"
                export_bucket "$bucket"
                import_bucket "$bucket"
            done
            update_file_urls > "${SCRIPT_DIR}/update_file_urls.sql"
            echo -e "${GREEN}Full migration complete!${NC}"
            ;;
        6)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo "======================================================================"
    echo "Storage Migration Instructions"
    echo "======================================================================"
    echo ""
    echo "MANUAL STEPS REQUIRED:"
    echo ""
    echo "1. Create buckets in Self-Hosted Supabase Dashboard:"
    for bucket in "${BUCKETS[@]}"; do
        echo "   - ${bucket}"
    done
    echo ""
    echo "2. Download files from Lovable Supabase:"
    echo "   - Go to Storage > Each bucket > Download all"
    echo "   - Save to: ${STORAGE_EXPORT_DIR}/<bucket-name>/"
    echo ""
    echo "3. Upload files to Self-Hosted Supabase:"
    echo "   - Go to Storage > Each bucket > Upload"
    echo "   - Upload from: ${STORAGE_EXPORT_DIR}/<bucket-name>/"
    echo ""
    echo "4. Update database URLs:"
    echo "   - Edit update_file_urls.sql"
    echo "   - Replace SOURCE_STORAGE_URL with old URL"
    echo "   - Replace TARGET_STORAGE_URL with new URL"
    echo "   - Run: psql -f update_file_urls.sql"
    echo ""
    echo "5. Verify files are accessible in your application"
    echo ""
    echo "======================================================================"
}

# Run main function
main
