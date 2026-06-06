// src/utils/deepMerge.js

/**
 * Recursively merges properties of multiple source objects into a target object.
 * This function performs a deep merge, meaning nested objects are also merged
 * rather than being overwritten. Arrays are concatenated.
 *
 * @param {object} target - The base object to merge into. It will not be mutated directly;
 *                          a new object will be created from it.
 * @param {...object} sources - One or more source objects whose properties will be merged.
 * @returns {object} A new object with properties from target and all sources deeply merged.
 */
function deepMerge(target, ...sources) {
  // Start with a shallow copy of the target object to ensure immutability
  const output = { ...target };

  // Helper function to determine if an item is a plain JavaScript object (not null, not an array)
  const isPlainObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

  sources.forEach(source => {
    // Skip if the current source is not a plain object
    if (!isPlainObject(source)) {
      return;
    }

    // Iterate over each key-value pair in the current source object
    Object.keys(source).forEach(key => {
      // Get the value from the output object and the source object for the current key
      const outputValue = output[key];
      const sourceValue = source[key];

      // Case 1: Both values are plain objects, perform a recursive deep merge
      if (isPlainObject(outputValue) && isPlainObject(sourceValue)) {
        output[key] = deepMerge(outputValue, sourceValue);
      }
      // Case 2: Both values are arrays, concatenate them
      else if (Array.isArray(outputValue) && Array.isArray(sourceValue)) {
        // Note: This concatenates arrays. For unique elements or specific merge logic,
        // further customization would be needed (e.g., using Set or a custom filter).
        output[key] = [...outputValue, ...sourceValue];
      }
      // Case 3: Otherwise (one is primitive, or one is an object/array while the other isn't),
      // overwrite with the source value. This handles primitives and replacement of different types.
      else {
        output[key] = sourceValue;
      }
    });
  });

  return output;
}

// Export the deepMerge function for module consumption
export default deepMerge;