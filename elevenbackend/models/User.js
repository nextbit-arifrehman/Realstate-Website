const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'users';

const User = {
  findByUid: async (db, uid) => {
    return db.collection(COLLECTION_NAME).findOne({ uid });
  },

  getAllUsers: async (db) => {
    return db.collection(COLLECTION_NAME).find({}).toArray();
  },

  updateUser: async (db, uid, updateData) => {
    return db.collection(COLLECTION_NAME).updateOne({ uid }, { $set: updateData });
  },

  deleteUserById: async (db, id) => {
    return db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
  },

  deleteUserByUid: async (db, uid) => {
    return db.collection(COLLECTION_NAME).deleteOne({ uid });
  },

  create: async (db, userData) => {
    const result = await db.collection(COLLECTION_NAME).insertOne(userData);
    // Find and return the newly created document
    return db.collection(COLLECTION_NAME).findOne({ _id: result.insertedId });
  },

  updateLastLogin: async (db, uid) => {
    return db.collection(COLLECTION_NAME).updateOne(
      { uid }, 
      { $set: { lastLoginAt: new Date() } }
    );
  }
};

module.exports = User;