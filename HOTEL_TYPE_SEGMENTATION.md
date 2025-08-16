# Hotel Type Segmentation Feature

## Overview

SmartServe now supports Customer Segmentation by Hotel Type, allowing different business types to access features relevant to their operations.

## Hotel Types

### 1. Food Cart (`cart`)
**Target:** Simple food carts and street vendors
**Features:**
- Single QR code for ordering
- Basic menu management (CRUD, availability toggle)
- Simple payment methods (UPI/Card/Cash)
- Daily sales summary only
- No table management or split billing

### 2. Restaurant (`restaurant`)
**Target:** Full-service restaurants
**Features:**
- QR code ordering per restaurant
- Enhanced menu management (allergy tags, modifiers)
- Split billing support
- Kitchen dashboard with batch view
- Advanced sales reports (top items, revenue breakdown)
- Staff role management (cashier, waiter, kitchen)

### 3. Hotel (`hotel`)
**Target:** Multi-outlet hotels and resorts
**Features:**
- QR ordering per room/outlet
- Multiple menu support (room service, restaurant)
- Advanced payment options (online, cash, charge to room)
- Multi-outlet kitchen dashboard
- Consolidated and outlet-wise reports
- Multi-outlet staff assignment
- Room billing integration (placeholder for future PMS integration)

## Technical Implementation

### Database Changes
- Added `hotel_type` ENUM column to `restaurants` table
- Values: `'cart'`, `'restaurant'`, `'hotel'`
- Default value: `'restaurant'` (for backward compatibility)

### Feature Flags System
- Centralized feature control via `src/lib/featureFlags.ts`
- Conditional rendering based on hotel type
- Clean separation of concerns

### New Components
- `ReportsView`: Advanced reporting for restaurant/hotel types
- `StaffView`: Staff management for restaurant/hotel types
- `SettingsView`: Business settings with feature information

### Updated Components
- `RestaurantSetup`: Now includes hotel type selection
- `Sidebar`: Dynamic menu based on available features
- `DashboardLayout`: Feature-aware content rendering

## Usage

### For Restaurant Owners
1. During signup, select your business type
2. Features will automatically be enabled/disabled based on selection
3. Dashboard will show only relevant features
4. Settings page displays available features for your type

### For Developers
```typescript
import { getFeatureFlags, getHotelTypeLabel } from '@/lib/featureFlags';

const features = getFeatureFlags(restaurant.hotel_type);

if (features.canUseKitchenDashboard) {
  // Show kitchen dashboard
}

if (features.canUseStaffRoles) {
  // Show staff management
}
```

## Migration

### Running the Migration
```bash
# Apply the new migration
supabase db push

# Or run manually
psql -h your-db-host -U your-user -d your-db -f supabase/migrations/20250817000000_add_hotel_type_segmentation.sql
```

### Test Data
```bash
# Create test accounts for each type
psql -h your-db-host -U your-user -d your-db -f scripts/create-test-data.sql
```

## Feature Matrix

| Feature | Food Cart | Restaurant | Hotel |
|---------|-----------|------------|-------|
| Basic Menu Management | ✅ | ✅ | ✅ |
| Allergy Tags | ❌ | ✅ | ✅ |
| Menu Modifiers | ❌ | ✅ | ✅ |
| Multiple Menus | ❌ | ❌ | ✅ |
| Split Billing | ❌ | ✅ | ✅ |
| Kitchen Dashboard | ❌ | ✅ | ✅ |
| Staff Management | ❌ | ✅ | ✅ |
| Advanced Reports | ❌ | ✅ | ✅ |
| Multi-outlet Support | ❌ | ❌ | ✅ |
| Room Service | ❌ | ❌ | ✅ |

## Future Enhancements

### Phase 2 Features
- **Food Cart**: Daily sales reports, inventory tracking
- **Restaurant**: Table management, reservation system
- **Hotel**: PMS integration, room billing, outlet management

### Advanced Features
- Custom feature packages
- Upgrade/downgrade between types
- White-label solutions
- API access levels

## Testing

### Manual Testing
1. Create accounts for each hotel type
2. Verify feature access restrictions
3. Test UI conditional rendering
4. Validate database constraints

### Automated Testing
```bash
# Run feature flag tests
npm test -- --grep "Feature Flags"

# Run hotel type tests
npm test -- --grep "Hotel Type"
```

## Support

For questions or issues with the Hotel Type Segmentation feature:
1. Check the feature flags configuration
2. Verify database migration was applied
3. Review component conditional rendering
4. Check browser console for errors

## Contributing

When adding new features:
1. Update the `FeatureFlags` interface
2. Add feature logic to `getFeatureFlags` function
3. Update relevant components with conditional rendering
4. Add tests for new feature flags
5. Update this documentation
