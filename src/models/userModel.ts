import { getDb } from '../config/db';
import { User, FcmToken } from '../types/index.ds';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// User operations
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const database = getDb();
  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';
  const [rows] = await database.execute<RowDataPacket[]>(query, [email]);
  return rows.length > 0 ? (rows[0] as User) : null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const database = getDb();
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await database.execute<RowDataPacket[]>(query, [id]);
  return rows.length > 0 ? (rows[0] as User) : null;
};

export const createUser = async (userData: {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
}): Promise<User> => {
  const database = getDb();
  const query = `
    INSERT INTO users (email, firstName, lastName, password)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await database.execute<ResultSetHeader>(query, [
    userData.email.toLowerCase(),
    userData.firstName || null,
    userData.lastName || null,
    userData.password,
  ]);

  const user = await getUserById(result.insertId);
  if (!user) {
    throw new Error('Failed to retrieve created user');
  }
  return user;
};

export const updateUser = async (
  id: number,
  updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }
): Promise<User | null> => {
  const database = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updateData.firstName !== undefined) {
    fields.push('firstName = ?');
    values.push(updateData.firstName);
  }
  if (updateData.lastName !== undefined) {
    fields.push('lastName = ?');
    values.push(updateData.lastName);
  }
  if (updateData.email !== undefined) {
    fields.push('email = ?');
    values.push(updateData.email.toLowerCase());
  }
  if (updateData.password !== undefined) {
    fields.push('password = ?');
    values.push(updateData.password);
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  await database.execute(query, values);

  return getUserById(id);
};

export const deleteUser = async (id: number): Promise<void> => {
  const database = getDb();
  const query = 'DELETE FROM users WHERE id = ?';
  await database.execute(query, [id]);
};

export const getAllUsers = async (): Promise<User[]> => {
  const database = getDb();
  const query = 'SELECT * FROM users ORDER BY createdAt DESC';
  const [rows] = await database.execute<RowDataPacket[]>(query);
  return rows as User[];
};

// FCM Token operations
export const getFcmTokensByUserId = async (
  userId: number
): Promise<FcmToken[]> => {
  const database = getDb();
  const query = 'SELECT * FROM fcm_tokens WHERE userId = ?';
  const [rows] = await database.execute<RowDataPacket[]>(query, [userId]);
  return rows as FcmToken[];
};

export const getFcmToken = async (
  userId: number,
  deviceId: string,
  fcmToken: string
): Promise<FcmToken | null> => {
  const database = getDb();
  const query =
    'SELECT * FROM fcm_tokens WHERE userId = ? AND deviceId = ? AND fcmToken = ?';
  const [rows] = await database.execute<RowDataPacket[]>(query, [userId, deviceId, fcmToken]);
  return rows.length > 0 ? (rows[0] as FcmToken) : null;
};

export const addFcmToken = async (fcmData: {
  userId: number;
  deviceId: string;
  fcmToken: string;
  platform?: string;
}): Promise<FcmToken> => {
  const database = getDb();
  const query = `
    INSERT INTO fcm_tokens (userId, deviceId, fcmToken, platform)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await database.execute<ResultSetHeader>(query, [
    fcmData.userId,
    fcmData.deviceId,
    fcmData.fcmToken,
    fcmData.platform || null,
  ]);

  const tokenQuery = 'SELECT * FROM fcm_tokens WHERE id = ?';
  const [rows] = await database.execute<RowDataPacket[]>(tokenQuery, [result.insertId]);
  return rows[0] as FcmToken;
};

export const removeFcmToken = async (
  userId: number,
  deviceId: string,
  fcmToken: string
): Promise<void> => {
  const database = getDb();
  const query =
    'DELETE FROM fcm_tokens WHERE userId = ? AND deviceId = ? AND fcmToken = ?';
  await database.execute(query, [userId, deviceId, fcmToken]);
};

