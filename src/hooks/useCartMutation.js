/**
 * Custom hook for cart mutations with optimistic updates
 * Abstracts the common pattern of optimistic cart updates, error handling, and rollback
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '@/lib/constants';
import { saveOrderToStorage } from '@/lib/storage';

/**
 * Hook for managing cart mutations with optimistic updates
 * 
 * @param {Object} cart - Current cart state
 * @param {Function} setCart - Cart state setter
 * @param {Object} version - Current order version
 * @param {Function} setVersion - Version setter
 * @param {string} orderId - Current order ID
 * @param {Function} updateOrderItems - API function to update order
 * @returns {Object} Mutation functions and state
 */
export function useCartMutation(cart, setCart, version, setVersion, orderId, updateOrderItems) {
  const [updatingItems, setUpdatingItems] = useState(new Set());

  /**
   * Execute a cart mutation with optimistic updates
   * 
   * @param {string} variationId - The variation ID being updated
   * @param {Function} computeNewCart - Function that returns the new cart state
   * @param {string} successMessage - Message to show on success
   * @returns {Promise<boolean>} Success status
   */
  const executeMutation = async (variationId, computeNewCart, successMessage) => {
    // Guard: don't mutate if already updating
    if (!orderId || updatingItems.has(variationId)) {
      return false;
    }

    // Store original cart for rollback
    const originalCart = cart;
    
    // Execute optimistic update
    const newCart = computeNewCart(cart);
    
    // Apply optimistic update
    setCart(newCart);
    
    // Mark item as updating
    setUpdatingItems(prev => new Set(prev).add(variationId));
    
    try {
      // Call API to persist changes
      const result = await updateOrderItems(orderId, version, newCart);
      
      if (result.success) {
        // Update version in state and localStorage
        setVersion(result.version);
        saveOrderToStorage(orderId, result.version);
        toast.success(successMessage);
        return true;
      } else if (result.isConflict) {
        // Conflict detected - revert optimistic update
        setCart(originalCart);
        toast.error(TOAST_MESSAGES.CART_CONFLICT);
        return false;
      } else {
        // Revert optimistic update
        setCart(originalCart);
        toast.error(result.error || TOAST_MESSAGES.CART_UPDATE_FAILED, { duration: 10000 });
        return false;
      }
    } catch (err) {
      // Revert optimistic update on exception
      setCart(originalCart);
      toast.error(TOAST_MESSAGES.CART_UPDATE_FAILED, { duration: 10000 });
      return false;
    } finally {
      // Remove updating state
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(variationId);
        return newSet;
      });
    }
  };

  return {
    executeMutation,
    updatingItems,
    setUpdatingItems
  };
}
