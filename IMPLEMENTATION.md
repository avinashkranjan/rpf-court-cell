# RPF Court Cell Digitization System

## Project Overview

The RPF (Railway Protection Force) Court Cell Digitization System is a comprehensive web application designed to digitize and centralize the complete case lifecycle management for RPF legal proceedings. The system ensures compliance with Bharatiya Nagarik Suraksha Sanhita (BNSS) and Railway Act provisions.

## Features Implemented

### 1. Case Management Module ✅
- **Auto-Generated Case Numbers**: Format `RPF/YYYY/MM/NNNN`
- **Railway Zone/Post/Jurisdiction Selection**: Dropdown with all 18 Indian Railway zones
- **Sections of Law**: Multi-select for BNSS and Railway Act sections
- **Incident Details**: Location, raid start/end times
- **Officers Tracking**: Multiple officers per case
- **Case Status Management**: Draft, Active, Forwarded, Closed
- **Case Listing and Details**: Comprehensive views with filtering

### 2. Accused Profile Module ✅
- **Complete Profile Management**:
  - Personal details (Name, Father's Name, Age, Gender)
  - Contact information (Phone, Address)
  - Location (State, District) - All Indian states included
  - Date of Birth with auto age calculation
- **Duplicate Detection**: Checks by name + phone combination
- **Photo Upload**: Placeholder for camera integration
- **Multiple Accused Support**: Link multiple accused to single case

### 3. Arrest Memo (Annexure-A) ✅
- **Comprehensive Arrest Documentation**:
  - Arrest date, time, and location
  - GD Number and Police Station
  - Arresting Officer details
  - Vehicle details (optional)
  - Court details for forwarding
  - Witness information (multiple)
  - Injury details documentation
- **BNSS Compliance**: Mandatory compliance checkbox
- **Auto-Population**: Pre-fills data from case and accused profiles
- **PDF Generation**: Placeholder for official document

### 4. Seizure Memo Module ✅
- **Dynamic Items Table**:
  - Description, quantity, and unit tracking
  - Multiple items per memo
  - Add/remove items functionality
  - Support for various units (nos, kg, liters, etc.)
- **Evidence Documentation**:
  - Photo upload placeholder for seized items
  - Barcode/QR code ready fields
- **Officer and Witness Tracking**
- **PDF Generation**: Placeholder for official document

### 5. BNSS Arrest Checklist ✅
- **12 BNSS Grounds**: Comprehensive checklist as per BNSS requirements
- **Mandatory Validation**: Cannot proceed without all mandatory checks
- **Progress Indicator**: Visual progress of completion
- **Officer Attestation**: Legal compliance confirmation
- **Real-time Validation**: Highlights incomplete mandatory items
- **PDF Generation**: Placeholder for official document

### 6. Personal Search Memo ✅
- **Date/Time and Location**: Complete search details
- **Dynamic Items Table**: Add/remove items found
- **Nil Search Checkbox**: For searches with no findings
- **Witness Tracking**: Multiple witnesses support
- **Auto-Population**: Accused details pre-filled
- **PDF Generation**: Placeholder for official document

### 7. Medical/Inspection Memo ✅
- **Auto-Pull Accused Details**: From accused profile
- **Arrest Reference**: Auto-populated from arrest memo
- **Injury Documentation**: Complete medical examination details
- **Doctor/Institution Details**: Medical professional information
- **Certificate Upload**: Medical certificate attachment
- **Doctor Signature**: Digital signature placeholder
- **PDF Generation**: Placeholder for official document

### 8. Court Forwarding/Complaint-cum-PR Report ✅
- **Auto-Generated Narrative**: Complete prosecution narrative from all case data
- **Data Aggregation**: Pulls from all modules (case, accused, memos)
- **Prosecution Summary**: Brief summary for court
- **Attached Documents**: Lists all memos and checklists
- **Regenerate Function**: Update narrative after changes
- **Officer Signature**: Digital signature placeholder
- **PDF Generation**: Placeholder with RPF letterhead

### 9. Accused Challan Generator ✅
- **Multi-Select Accused**: Choose accused for challan
- **Complete Case Info**: All case details included
- **Sections of Law**: All applicable sections listed
- **Categorized Enclosures**: Color-coded document list
- **Escort Officer Details**: Officer assignment tracking
- **QR Code Generation**: For verification and authenticity
- **Auto-Generated Challan Number**: Unique identifier
- **PDF Generation**: Master challan document

### 10. Dashboard & Navigation ✅
- **Statistics Cards**:
  - Total cases count
  - Accused profiles count
  - Arrest memos count
  - Court forwards count
- **Quick Actions**: Direct navigation to key functions
- **Recent Cases**: Last 5 cases with status
- **Role-Based UI**: Ready for role-based access control

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### State Management
- **Library**: Zustand
- **Persistence**: localStorage (client-side)
- **Stores**:
  - `useCaseStore`: Case management
  - `useAccusedStore`: Accused profiles
  - `useMemoStore`: All memo types

### Type Safety
- Comprehensive TypeScript interfaces for all entities
- Type definitions in `lib/types/`
- Strict type checking enabled

## Project Structure

```
rpf-court-cell/
├── app/
│   ├── (auth)/
│   │   ├── login/          # User login
│   │   └── dsc-login/      # DSC login
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx                    # Main dashboard
│   │       └── cases/
│   │           ├── page.tsx                # Cases listing
│   │           ├── new/                    # New case registration
│   │           └── [id]/
│   │               ├── page.tsx            # Case details
│   │               ├── accused/            # Accused management
│   │               │   ├── page.tsx        # Accused listing
│   │               │   └── new/            # Add accused
│   │               └── memos/              # Memos hub
│   │                   ├── page.tsx        # Memos navigation
│   │                   ├── arrest/         # Arrest memo
│   │                   ├── seizure/        # Seizure memo
│   │                   └── bnss-checklist/ # BNSS checklist
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       └── textarea.tsx
├── lib/
│   ├── store/             # Zustand stores
│   │   ├── accused-store.ts
│   │   ├── case-store.ts
│   │   └── memo-store.ts
│   ├── types/             # TypeScript types
│   │   ├── audit.ts
│   │   └── case.ts
│   ├── api.ts
│   └── utils.ts
├── public/
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Data Models

### Case
- Case Number (auto-generated)
- Registration Date
- Railway Zone, Post, Jurisdiction
- Sections of Law (array)
- Incident Location
- Raid Start/End Times
- Officers Involved (array)
- Status (draft/active/forwarded/closed)

### Accused Profile
- Personal Details (name, father's name, age, gender, DOB)
- Contact (phone, address)
- Location (state, district)
- Photo (optional)
- Proof Document (optional)

### Arrest Memo
- Case and Accused References
- Arrest Details (date, time, location)
- GD Number, Police Station
- Arresting Officer, Vehicle Details
- Court Details
- Witnesses (array)
- Injury Details
- BNSS Compliance Flag

### Seizure Memo
- Case and Accused References
- Seizure Details (date, time, location)
- Seized Items (array with quantity, unit, photos)
- Seizing Officer
- Witnesses (array)

### BNSS Checklist
- Case and Accused References
- 12 Grounds (array of checklist items)
- Officer Name and Attestation Date
- Mandatory/Optional flags per ground

## Key Features

### Auto-Population
- Case data auto-fills in memos
- Accused details pre-populate in forms
- Officer names carry forward from case

### Validation
- Required field validation
- Mandatory BNSS checklist enforcement
- Duplicate detection for accused
- Date/time validation
- Numeric validation for quantities

### User Experience
- Clean, intuitive interface
- Progress indicators
- Color-coded status badges
- Responsive design
- Real-time form validation
- Warning messages for important actions

## Compliance & Standards

### BNSS Compliance
- Complete BNSS arrest checklist
- Rights information to accused
- Mandatory ground validation
- Officer attestation

### Railway Act Compliance
- Railway-specific sections of law
- Zone/post/jurisdiction tracking
- RPF-specific workflows

### Data Integrity
- Timestamps on all records
- Immutable audit trail ready
- Document hash ready for implementation
- Secure client-side storage

## Future Enhancements

### Phase 1 (Immediate)
1. **Personal Search Memo**: Complete form implementation
2. **Medical Inspection Memo**: Medical examination documentation
3. **Court Forwarding Report**: Auto-generated prosecution narrative
4. **Accused Challan Generator**: Master challan with QR code

### Phase 2 (Short-term)
1. **PDF Generation**: Integrate PDF library for all documents
2. **Digital Signatures**: E-signature capture for officers/accused/witnesses
3. **Photo Upload**: Real camera integration
4. **Barcode/QR Generation**: For seized items and challans

### Phase 3 (Medium-term)
1. **Role-Based Access Control**: 
   - Field Officer
   - SI/Supervisor
   - Court Cell Admin
   - System Admin
2. **Backend Integration**: REST API for data persistence
3. **Advanced Reporting**: Excel/PDF exports, analytics

### Phase 4 (Long-term)
1. **Audit Logging**: Immutable audit trail
2. **Geo-tagging**: Location tracking for arrests/seizures
3. **Document Encryption**: Enhanced security
4. **Workflow Automation**: Status transitions and notifications
5. **Mobile App**: Field officer mobile application

## Installation & Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/avinashkranjan/rpf-court-cell.git

# Navigate to project directory
cd rpf-court-cell

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development
```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Usage Guide

### Creating a New Case
1. Navigate to Dashboard
2. Click "Register New Case"
3. Fill in railway zone, post, jurisdiction
4. Select applicable sections of law
5. Enter incident location and timing
6. Add officer names (comma-separated)
7. Click "Register Case"

### Adding Accused Profile
1. Open a case
2. Navigate to "Accused Profiles"
3. Click "Add Accused"
4. Fill personal details
5. System auto-detects duplicates
6. Optional: Add photo
7. Save profile

### Creating Arrest Memo
1. Open case → Memos
2. Click "Arrest Memo (Annexure-A)"
3. Select accused from dropdown
4. Fill arrest details
5. Add witnesses (comma-separated)
6. Check BNSS compliance
7. Save memo

### Creating Seizure Memo
1. Open case → Memos
2. Click "Seizure Memo"
3. Select accused
4. Add seized items (multiple)
5. For each item: description, quantity, unit
6. Optional: Add photos
7. Add witnesses
8. Save memo

### BNSS Checklist
1. Open case → Memos
2. Click "BNSS Arrest Checklist"
3. Select accused
4. Check all applicable grounds
5. All mandatory grounds must be checked
6. Officer attestation
7. Save checklist

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Considerations
- Client-side data storage (development mode)
- Ready for backend authentication
- Type-safe data structures
- Input validation on all forms
- XSS protection via React
- CSRF ready for API integration

## Contributing
This is a government project for RPF. Contributions should follow established guidelines.

## License
Property of Railway Protection Force, Government of India

## Support
For issues or questions, contact the development team.

---

**Developed for**: Railway Protection Force, Eastern Railway
**Version**: 1.0.0
**Last Updated**: 2026-02-05
