import { getDb } from '../config/db';
import { User, FcmToken } from '../types/index.ds';
import { hashPassword, comparePassword } from '../utils/helper';
import sql from 'mssql';

// User operations
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const database = getDb();
  const request = database.request();
  request.input('email', sql.NVarChar, email.toLowerCase());
  const result = await request.query('SELECT * FROM users WHERE LOWER(email) = @email');
  return result.recordset.length > 0 ? (result.recordset[0] as User) : null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM users WHERE id = @id');
  return result.recordset.length > 0 ? (result.recordset[0] as User) : null;
};

export const createUser = async (userData: {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
}): Promise<User> => {
  const database = getDb();
  const request = database.request();
  
  // Hash the password before storing
  const hashedPassword = await hashPassword(userData.password);
  
  request.input('email', sql.NVarChar, userData.email.toLowerCase());
  request.input('firstName', sql.NVarChar, userData.firstName || null);
  request.input('lastName', sql.NVarChar, userData.lastName || null);
  request.input('password', sql.NVarChar, hashedPassword);
  
  const result = await request.query(`
    INSERT INTO users (email, firstName, lastName, password)
    OUTPUT INSERTED.id
    VALUES (@email, @firstName, @lastName, @password)
  `);

  const insertedId = result.recordset[0].id;
  const user = await getUserById(insertedId);
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
  const request = database.request();

  if (updateData.firstName !== undefined) {
    fields.push('firstName = @firstName');
    request.input('firstName', sql.NVarChar, updateData.firstName);
  }
  if (updateData.lastName !== undefined) {
    fields.push('lastName = @lastName');
    request.input('lastName', sql.NVarChar, updateData.lastName);
  }
  if (updateData.email !== undefined) {
    fields.push('email = @email');
    request.input('email', sql.NVarChar, updateData.email.toLowerCase());
  }
  if (updateData.password !== undefined) {
    fields.push('password = @password');
    const hashedPassword = await hashPassword(updateData.password);
    request.input('password', sql.NVarChar, hashedPassword);
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  request.input('id', sql.Int, id);
  const query = `UPDATE users SET ${fields.join(', ')}, updatedAt = GETDATE() WHERE id = @id`;
  await request.query(query);

  return getUserById(id);
};

export const deleteUser = async (id: number): Promise<void> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  await request.query('DELETE FROM users WHERE id = @id');
};

export const getAllUsers = async (): Promise<User[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM users ORDER BY createdAt DESC');
  return result.recordset as User[];
};

// FCM Token operations
export const getFcmTokensByUserId = async (
  userId: number
): Promise<FcmToken[]> => {
  const database = getDb();
  const request = database.request();
  request.input('userId', sql.Int, userId);
  const result = await request.query('SELECT * FROM fcm_tokens WHERE userId = @userId');
  return result.recordset as FcmToken[];
};

export const getFcmToken = async (
  userId: number,
  deviceId: string,
  fcmToken: string
): Promise<FcmToken | null> => {
  const database = getDb();
  const request = database.request();
  request.input('userId', sql.Int, userId);
  request.input('deviceId', sql.NVarChar, deviceId);
  request.input('fcmToken', sql.NVarChar, fcmToken);
  const result = await request.query(
    'SELECT * FROM fcm_tokens WHERE userId = @userId AND deviceId = @deviceId AND fcmToken = @fcmToken'
  );
  return result.recordset.length > 0 ? (result.recordset[0] as FcmToken) : null;
};

export const addFcmToken = async (fcmData: {
  userId: number;
  deviceId: string;
  fcmToken: string;
  platform?: string;
}): Promise<FcmToken> => {
  const database = getDb();
  const request = database.request();
  request.input('userId', sql.Int, fcmData.userId);
  request.input('deviceId', sql.NVarChar, fcmData.deviceId);
  request.input('fcmToken', sql.NVarChar, fcmData.fcmToken);
  request.input('platform', sql.NVarChar, fcmData.platform || null);
  
  const result = await request.query(`
    INSERT INTO fcm_tokens (userId, deviceId, fcmToken, platform)
    OUTPUT INSERTED.id
    VALUES (@userId, @deviceId, @fcmToken, @platform)
  `);

  const insertedId = result.recordset[0].id;
  const tokenRequest = database.request();
  tokenRequest.input('id', sql.Int, insertedId);
  const tokenResult = await tokenRequest.query('SELECT * FROM fcm_tokens WHERE id = @id');
  return tokenResult.recordset[0] as FcmToken;
};

export const removeFcmToken = async (
  userId: number,
  deviceId: string,
  fcmToken: string
): Promise<void> => {
  const database = getDb();
  const request = database.request();
  request.input('userId', sql.Int, userId);
  request.input('deviceId', sql.NVarChar, deviceId);
  request.input('fcmToken', sql.NVarChar, fcmToken);
  await request.query(
    'DELETE FROM fcm_tokens WHERE userId = @userId AND deviceId = @deviceId AND fcmToken = @fcmToken'
  );
};

// Authentication function
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  
  return user;
};

