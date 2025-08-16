import { Database } from '@/integrations/supabase/types';

export type HotelType = Database['public']['Tables']['restaurants']['Row']['hotel_type'];

export interface FeatureFlags {
  // Menu Management
  canUseAllergyTags: boolean;
  canUseModifiers: boolean;
  canUseMultipleMenus: boolean;
  
  // Ordering & Billing
  canUseSplitBilling: boolean;
  canUseRoomBilling: boolean;
  canUseMultiplePaymentMethods: boolean;
  
  // Kitchen & Staff
  canUseKitchenDashboard: boolean;
  canUseBatchView: boolean;
  canUseMultiOutletSupport: boolean;
  canUseStaffRoles: boolean;
  canUseMultipleOutletAssignment: boolean;
  
  // Reports & Analytics
  canUseAdvancedReports: boolean;
  canUseTopItemsReport: boolean;
  canUseRevenueBreakdown: boolean;
  canUseOutletWiseReports: boolean;
  canUseConsolidatedReports: boolean;
  
  // QR & Tables
  canUseMultipleQRCodes: boolean;
  canUseTableManagement: boolean;
  canUseRoomService: boolean;
}

export const getFeatureFlags = (hotelType: HotelType): FeatureFlags => {
  switch (hotelType) {
    case 'cart':
      return {
        // Menu Management - Basic
        canUseAllergyTags: false,
        canUseModifiers: false,
        canUseMultipleMenus: false,
        
        // Ordering & Billing - Simple
        canUseSplitBilling: false,
        canUseRoomBilling: false,
        canUseMultiplePaymentMethods: false,
        
        // Kitchen & Staff - Basic
        canUseKitchenDashboard: false,
        canUseBatchView: false,
        canUseMultiOutletSupport: false,
        canUseStaffRoles: false,
        canUseMultipleOutletAssignment: false,
        
        // Reports & Analytics - Basic
        canUseAdvancedReports: false,
        canUseTopItemsReport: false,
        canUseRevenueBreakdown: false,
        canUseOutletWiseReports: false,
        canUseConsolidatedReports: false,
        
        // QR & Tables - Single
        canUseMultipleQRCodes: false,
        canUseTableManagement: false,
        canUseRoomService: false,
      };
      
    case 'restaurant':
      return {
        // Menu Management - Enhanced
        canUseAllergyTags: true,
        canUseModifiers: true,
        canUseMultipleMenus: false,
        
        // Ordering & Billing - Enhanced
        canUseSplitBilling: true,
        canUseRoomBilling: false,
        canUseMultiplePaymentMethods: true,
        
        // Kitchen & Staff - Enhanced
        canUseKitchenDashboard: true,
        canUseBatchView: true,
        canUseMultiOutletSupport: false,
        canUseStaffRoles: true,
        canUseMultipleOutletAssignment: false,
        
        // Reports & Analytics - Enhanced
        canUseAdvancedReports: true,
        canUseTopItemsReport: true,
        canUseRevenueBreakdown: true,
        canUseOutletWiseReports: false,
        canUseConsolidatedReports: false,
        
        // QR & Tables - Enhanced
        canUseMultipleQRCodes: true,
        canUseTableManagement: true,
        canUseRoomService: false,
      };
      
    case 'hotel':
      return {
        // Menu Management - Full
        canUseAllergyTags: true,
        canUseModifiers: true,
        canUseMultipleMenus: true,
        
        // Ordering & Billing - Full
        canUseSplitBilling: true,
        canUseRoomBilling: true,
        canUseMultiplePaymentMethods: true,
        
        // Kitchen & Staff - Full
        canUseKitchenDashboard: true,
        canUseBatchView: true,
        canUseMultiOutletSupport: true,
        canUseStaffRoles: true,
        canUseMultipleOutletAssignment: true,
        
        // Reports & Analytics - Full
        canUseAdvancedReports: true,
        canUseTopItemsReport: true,
        canUseRevenueBreakdown: true,
        canUseOutletWiseReports: true,
        canUseConsolidatedReports: true,
        
        // QR & Tables - Full
        canUseMultipleQRCodes: true,
        canUseTableManagement: true,
        canUseRoomService: true,
      };
      
    default:
      return getFeatureFlags('restaurant'); // Default to restaurant features
  }
};

export const getHotelTypeLabel = (hotelType: HotelType): string => {
  switch (hotelType) {
    case 'cart':
      return 'Food Cart';
    case 'restaurant':
      return 'Restaurant';
    case 'hotel':
      return 'Hotel';
    default:
      return 'Restaurant';
  }
};

export const getHotelTypeDescription = (hotelType: HotelType): string => {
  switch (hotelType) {
    case 'cart':
      return 'Simple food cart with basic ordering and menu management';
    case 'restaurant':
      return 'Full-service restaurant with advanced features and staff management';
    case 'hotel':
      return 'Multi-outlet hotel with comprehensive features and room service';
    default:
      return 'Full-service restaurant with advanced features and staff management';
  }
};
