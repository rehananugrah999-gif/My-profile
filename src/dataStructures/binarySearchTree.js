/**
 * Represents a Node in a Binary Search Tree.
 * Each node has a value, and references to its left and right children.
 */
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

/**
 * Implements a Binary Search Tree (BST) data structure.
 * A BST is a tree-based data structure where each node has at most two children,
 * referred to as the left and right children. For every node, all values in its
 * left subtree are less than the node's value, and all values in its right
 * subtree are greater than the node's value.
 */
class BinarySearchTree {
    constructor() {
        this.root = null; // The root node of the BST
        this._lastOperationSuccessful = false; // Internal flag to track success of operations like delete
    }

    /**
     * Inserts a new value into the BST.
     * If the tree is empty, the new value becomes the root.
     * Otherwise, it traverses the tree to find the correct position for the new value,
     * ensuring the BST properties are maintained.
     * @param {any} value - The value to insert.
     * @returns {BinarySearchTree | undefined} This tree instance or undefined if duplicate.
     */
    insert(value) {
        const newNode = new Node(value);
        if (this.root === null) {
            this.root = newNode;
            return this;
        }

        let current = this.root;
        while (true) {
            // Disallow duplicate values (or handle as per specific requirements)
            if (value === current.value) return undefined;

            if (value < current.value) {
                // Go left if the new value is smaller
                if (current.left === null) {
                    current.left = newNode;
                    return this;
                }
                current = current.left;
            } else {
                // Go right if the new value is larger
                if (current.right === null) {
                    current.right = newNode;
                    return this;
                }
                current = current.right;
            }
        }
    }

    /**
     * Searches for a value within the BST.
     * Traverses the tree starting from the root, comparing the target value
     * with the current node's value to decide whether to go left or right.
     * @param {any} value - The value to search for.
     * @returns {Node | null} The node containing the value if found, otherwise null.
     */
    search(value) {
        if (this.root === null) return null;

        let current = this.root;
        while (current) {
            if (value === current.value) {
                return current;
            } else if (value < current.value) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return null; // Value not found in the tree
    }

    /**
     * Finds the minimum value node in the BST (which is the leftmost node of a given subtree).
     * @param {Node} [node=this.root] - The starting node for the search (defaults to root).
     * @returns {Node | null} The node with the minimum value, or null if the tree/subtree is empty.
     */
    min(node = this.root) {
        if (!node) return null;
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    }

    /**
     * Finds the maximum value node in the BST (which is the rightmost node of a given subtree).
     * @param {Node} [node=this.root] - The starting node for the search (defaults to root).
     * @returns {Node | null} The node with the maximum value, or null if the tree/subtree is empty.
     */
    max(node = this.root) {
        if (!node) return null;
        let current = node;
        while (current.right) {
            current = current.right;
        }
        return current;
    }

    /**
     * Deletes a value from the BST.
     * This is the most complex operation, handling three cases for the node to be deleted:
     * 1. Node has no children (leaf node).
     * 2. Node has one child.
     * 3. Node has two children (requires finding an inorder successor/predecessor).
     * @param {any} value - The value to delete.
     * @returns {boolean} True if the value was found and successfully deleted, false otherwise.
     */
    delete(value) {
        this._lastOperationSuccessful = false; // Reset internal flag
        this.root = this._deleteNode(this.root, value);
        return this._lastOperationSuccessful; // Return the status of the deletion
    }

    /**
     * Helper function for recursive deletion. It modifies the subtree rooted at 'node'
     * by removing 'value' and returns the new root of that modified subtree.
     * It also sets `_lastOperationSuccessful` to true if a node is actually deleted.
     * @param {Node | null} node - The current node being considered.
     * @param {any} value - The value to delete.
     * @returns {Node | null} The new root of the (sub)tree after deletion.
     * @private
     */
    _deleteNode(node, value) {
        if (node === null) {
            return null; // Value not found in this subtree
        }

        if (value < node.value) {
            node.left = this._deleteNode(node.left, value);
            return node;
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value);
            return node;
        } else {
            // Value found, 'node' is the node to be deleted
            this._lastOperationSuccessful = true; // Mark as successful deletion

            // Case 1 & 2: Node has no children or one child
            if (node.left === null) {
                return node.right; // Replace with right child (could be null if leaf node)
            } else if (node.right === null) {
                return node.left; // Replace with left child
            }

            // Case 3: Node has two children
            // Find the inorder successor (smallest value in the right subtree)
            const temp = this.min(node.right);
            node.value = temp.value; // Replace node's value with successor's value
            // Recursively delete the inorder successor from the right subtree
            // The successor is guaranteed to have at most one right child, simplifying its deletion.
            node.right = this._deleteNode(node.right, temp.value);
            return node;
        }
    }

    /**
     * Performs an In-Order Traversal of the BST.
     * Visits nodes in ascending order of their values: Left -> Root -> Right.
     * @returns {Array<any>} An array containing the values in in-order sequence.
     */
    inOrderTraversal() {
        const result = [];
        this._inOrder(this.root, result);
        return result;
    }

    /**
     * Helper for in-order traversal.
     * @param {Node | null} node - The current node.
     * @param {Array<any>} result - The array to accumulate values.
     * @private
     */
    _inOrder(node, result) {
        if (node) {
            this._inOrder(node.left, result);
            result.push(node.value);
            this._inOrder(node.right, result);
        }
    }

    /**
     * Performs a Pre-Order Traversal of the BST.
     * Visits nodes in Root -> Left -> Right order. Useful for copying the tree structure.
     * @returns {Array<any>} An array containing the values in pre-order sequence.
     */
    preOrderTraversal() {
        const result = [];
        this._preOrder(this.root, result);
        return result;
    }

    /**
     * Helper for pre-order traversal.
     * @param {Node | null} node - The current node.
     * @param {Array<any>} result - The array to accumulate values.
     * @private
     */
    _preOrder(node, result) {
        if (node) {
            result.push(node.value);
            this._preOrder(node.left, result);
            this._preOrder(node.right, result);
        }
    }

    /**
     * Performs a Post-Order Traversal of the BST.
     * Visits nodes in Left -> Right -> Root order. Useful for deleting the tree entirely.
     * @returns {Array<any>} An array containing the values in post-order sequence.
     */
    postOrderTraversal() {
        const result = [];
        this._postOrder(this.root, result);
        return result;
    }

    /**
     * Helper for post-order traversal.
     * @param {Node | null} node - The current node.
     * @param {Array<any>} result - The array to accumulate values.
     * @private
     */
    _postOrder(node, result) {
        if (node) {
            this._postOrder(node.left, result);
            this._postOrder(node.right, result);
            result.push(node.value);
        }
    }

    /**
     * Performs a Breadth-First Search (BFS) / Level Order Traversal of the BST.
     * Visits nodes level by level, from left to right.
     * @returns {Array<any>} An array containing the values in level-order sequence.
     */
    bfsTraversal() {
        if (!this.root) return [];

        const result = [];
        const queue = [this.root]; // Initialize queue with the root node

        while (queue.length > 0) {
            const currentNode = queue.shift(); // Dequeue the front node
            result.push(currentNode.value);

            // Enqueue left child if it exists
            if (currentNode.left) {
                queue.push(currentNode.left);
            }
            // Enqueue right child if it exists
            if (currentNode.right) {
                queue.push(currentNode.right);
            }
        }
        return result;
    }
}

// Export the BinarySearchTree class for modular use
// export default BinarySearchTree;
// module.exports = BinarySearchTree;
