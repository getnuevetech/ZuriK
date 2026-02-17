export const MESSAGES = {
  // Auth messages
  AUTH: {
    REGISTER_SUCCESS: 'Registration successful',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User with this email or username already exists',
    ACCOUNT_DEACTIVATED: 'Account is deactivated',
    UNAUTHORIZED: 'Unauthorized access',
  },

  // User messages
  USER: {
    UPDATE_SUCCESS: 'User updated successfully',
    NOT_FOUND: 'User not found',
    FORBIDDEN_UPDATE: 'You can only update your own profile',
  },

  // Design messages
  DESIGN: {
    CREATE_SUCCESS: 'Design created successfully',
    UPDATE_SUCCESS: 'Design updated successfully',
    DELETE_SUCCESS: 'Design deleted successfully',
    NOT_FOUND: 'Design not found',
    FORBIDDEN_UPDATE: 'You can only update your own designs',
    FORBIDDEN_DELETE: 'You can only delete your own designs',
  },

  // Fabric messages
  FABRIC: {
    CREATE_SUCCESS: 'Fabric created successfully',
    UPDATE_SUCCESS: 'Fabric updated successfully',
    DELETE_SUCCESS: 'Fabric deleted successfully',
    NOT_FOUND: 'Fabric not found',
    FORBIDDEN_UPDATE: 'You can only update your own fabric listings',
    FORBIDDEN_DELETE: 'You can only delete your own fabric listings',
    INSUFFICIENT_STOCK: 'Insufficient stock',
  },

  // Order messages
  ORDER: {
    CREATE_SUCCESS: 'Order created successfully',
    UPDATE_SUCCESS: 'Order status updated successfully',
    NOT_FOUND: 'Order not found',
    FORBIDDEN_VIEW: 'You can only view your own orders',
    FORBIDDEN_UPDATE: 'You do not have permission to update this order',
    ITEM_NOT_FOUND: 'Item not found',
  },

  // Measurement messages
  MEASUREMENT: {
    CREATE_SUCCESS: 'Measurement created successfully',
    UPDATE_SUCCESS: 'Measurement updated successfully',
    DELETE_SUCCESS: 'Measurement deleted successfully',
    NOT_FOUND: 'Measurement not found',
    FORBIDDEN_VIEW: 'You can only view your own measurements',
    FORBIDDEN_UPDATE: 'You can only update your own measurements',
    FORBIDDEN_DELETE: 'You can only delete your own measurements',
  },

  // Admin messages
  ADMIN: {
    ROLE_UPDATE_SUCCESS: 'User role updated successfully',
    FORBIDDEN: 'Admin access required',
  },

  // Generic messages
  GENERIC: {
    SUCCESS: 'Operation successful',
    ERROR: 'An error occurred',
    VALIDATION_ERROR: 'Validation failed',
    NOT_FOUND: 'Resource not found',
    FORBIDDEN: 'Access forbidden',
    UNAUTHORIZED: 'Authentication required',
  },
};
