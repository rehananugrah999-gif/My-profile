/**
 * @fileoverview Utility functions for data processing, specifically for grouping array elements.
 * This module provides a flexible 'groupBy' function that can group items based on a property or a custom function.
 */

/**
 * Groups an array of objects by a specified key or the result of a callback function.
 *
 * @param {Array<Object>} array The array of objects to group.
 * @param {string | Function} keySelector A string representing the property name to group by,
 *                                        or a function that returns the key for each item.
 * @returns {Object<string, Array<Object>>} An object where keys are the grouping values
 *                                         and values are arrays of items belonging to that group.
 *
 * @example
 * const products = [
 *   { id: 1, name: 'Laptop', category: 'Electronics', price: 1200 },
 *   { id: 2, name: 'Mouse', category: 'Electronics', price: 25 },
 *   { id: 3, name: 'Keyboard', category: 'Electronics', price: 75 },
 *   { id: 4, name: 'Book', category: 'Books', price: 20 },
 *   { id: 5, name: 'Monitor', category: 'Electronics', price: 300 }
 * ];
 *
 * // Group by category string
 * const groupedByCategory = groupBy(products, 'category');
 * // Output:
 * // {
 * //   "Electronics": [{...}, {...}, {...}, {...}],
 * //   "Books": [{...}]
 * // }
 *
 * // Group by price range using a function
 * const groupedByPriceRange = groupBy(products, item => {
 *   if (item.price < 100) return 'Affordable';
 *   if (item.price < 500) return 'Mid-Range';
 *   return 'High-End';
 * });
 * // Output:
 * // {
 * //   "High-End": [{...}], // Laptop
 * //   "Affordable": [{...}, {...}, {...}], // Mouse, Keyboard, Book
 * //   "Mid-Range": [{...}] // Monitor
 * // }
 */
export function groupBy(array, keySelector) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected an array for the first argument.');
  }
  if (typeof keySelector !== 'string' && typeof keySelector !== 'function') {
    throw new TypeError('Expected keySelector to be a string or a function.');
  }

  // Use reduce to iterate over the array and build the grouped object
  return array.reduce((accumulator, currentItem) => {
    // Determine the key for the current item based on the keySelector type
    const key = typeof keySelector === 'function'
      ? keySelector(currentItem) // If it's a function, call it with the item
      : String(currentItem[keySelector]); // If it's a string, access the property and convert to string

    // Ensure the key exists in the accumulator, if not, initialize it with an empty array
    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    // Push the current item into the corresponding group array
    accumulator[key].push(currentItem);

    // Return the updated accumulator for the next iteration
    return accumulator;
  }, {}); // Initialize accumulator as an empty object
}
