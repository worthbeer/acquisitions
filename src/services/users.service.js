import { eq } from 'drizzle-orm';
import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { hashPassword } from '#services/auth.service.js';

const userFields = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

export const getAllUsers = async () => {
  try {
    return await db.select(userFields).from(users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select(userFields)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  } catch (e) {
    logger.error(`Error getting user ${id}`, e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!existing) throw new Error('User not found');

    const payload = { ...updates, updated_at: new Date() };
    if (payload.password)
      payload.password = await hashPassword(payload.password);

    const [updated] = await db
      .update(users)
      .set(payload)
      .where(eq(users.id, id))
      .returning(userFields);
    return updated;
  } catch (e) {
    logger.error(`Error updating user ${id}`, e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!existing) throw new Error('User not found');
    await db.delete(users).where(eq(users.id, id));
  } catch (e) {
    logger.error(`Error deleting user ${id}`, e);
    throw e;
  }
};
