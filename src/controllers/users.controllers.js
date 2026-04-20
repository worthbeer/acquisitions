import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users..');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validation = userIdSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validation.error),
      });
    }
    const { id } = validation.data;
    logger.info(`Getting user ${id}`);
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }
    const { id } = idValidation.data;

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const isOwner = req.user.id === id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: 'Forbidden' });

    const updates = { ...bodyValidation.data };
    if (!isAdmin) delete updates.role;

    logger.info(`Updating user ${id}`);
    const user = await updateUser(id, updates);
    res.json({ message: 'User updated successfully', user });
  } catch (e) {
    logger.error(e);
    if (e.message === 'User not found')
      return res.status(404).json({ error: 'User not found' });
    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const validation = userIdSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validation.error),
      });
    }
    const { id } = validation.data;

    const isOwner = req.user.id === id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: 'Forbidden' });

    logger.info(`Deleting user ${id}`);
    await deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    logger.error(e);
    if (e.message === 'User not found')
      return res.status(404).json({ error: 'User not found' });
    next(e);
  }
};
