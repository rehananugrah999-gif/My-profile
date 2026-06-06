/**
 * @module Debounce Utility
 * @description Provides a higher-order function to debounce any given function.
 * Debouncing ensures that a function is not called too frequently. Instead, it waits for a certain
 * period of inactivity before executing the function. This is particularly useful for events
 * that fire rapidly, like window resizing, scrolling, or typing in a search box.
 *
 * @param {Function} func The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {Function} A new debounced version of the original function.
 */
const debounce = (func, delay) => {
  // A timer ID to keep track of the setTimeout call.
  // This allows us to clear the previous timer if the function is called again within the delay period.
  let timeoutId;

  // Return a new function that will be the debounced version.
  return function(...args) {
    // Store the context (this) of the original call.
    // This ensures that 'this' inside the debounced function refers to the correct object.
    const context = this;

    // Clear any existing timer. If the function is called again before the delay expires,
    // the previous execution is cancelled.
    clearTimeout(timeoutId);

    // Set a new timer. The 'func' will be executed only after the 'delay' has passed
    // without any new calls to the debounced function.
    timeoutId = setTimeout(() => {
      // Use .apply() to call the original function with the correct 'this' context
      // and the arguments passed to the debounced function.
      func.apply(context, args);
    }, delay);
  };
};

export default debounce;
