import express from 'express';
import User from '../models/user.model.js';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, getUserByEmail, loginUser } from '../controllers/user.controller.js';

const router = express.Router();

// Create a user
router.post('/', createUser);
// Register user (alias for createUser)
router.post('/register', createUser);

// Update a user by ID
router.put('/:id', updateUser);

// Delete a user by ID
router.delete('/:id', deleteUser);

// Get all users
router.get('/', getAllUsers);

// Get a user by ID
router.get('/:id', getUserById);

// Get a user by email
router.get('/email/:email', getUserByEmail);

// Login user
router.post('/login', loginUser);

export default router;