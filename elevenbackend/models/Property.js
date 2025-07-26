const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'properties';

const Property = {
  create: async (db, propertyData) => {
    const result = await db.collection(COLLECTION_NAME).insertOne(propertyData);
    return db.collection(COLLECTION_NAME).findOne({ _id: result.insertedId });
  },

  getAllProperties: async (db, filter, sortOptions) => {
    return db.collection(COLLECTION_NAME).find(filter).sort(sortOptions).toArray();
  },

  getPropertyById: async (db, id) => {
    // Try finding by custom string ID first (property1, property2, etc.)
    let property = await db.collection(COLLECTION_NAME).findOne({ _id: id });
    
    // If not found and id looks like ObjectId, try ObjectId format
    if (!property && ObjectId.isValid(id)) {
      property = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    }
    
    return property;
  },

  updateProperty: async (db, id, updateData) => {
    // Try custom string ID first
    let result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    // If not found and id looks like ObjectId, try ObjectId format
    if (result.matchedCount === 0 && ObjectId.isValid(id)) {
      result = await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    }
    
    return result.modifiedCount > 0;
  },

  deleteProperty: async (db, id) => {
    // Try custom string ID first
    let result = await db.collection(COLLECTION_NAME).deleteOne({ _id: id });
    
    // If not found and id looks like ObjectId, try ObjectId format
    if (result.deletedCount === 0 && ObjectId.isValid(id)) {
      result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    }
    
    return result.deletedCount > 0;
  },

  updateVerificationStatus: async (db, id, status) => {
    // Try custom string ID first
    let result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: id },
      { $set: { verificationStatus: status } }
    );
    
    // If not found and id looks like ObjectId, try ObjectId format
    if (result.matchedCount === 0 && ObjectId.isValid(id)) {
      result = await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: { verificationStatus: status } }
      );
    }
    
    return result.modifiedCount > 0;
  },

  advertiseProperty: async (db, id, isAdvertised) => {
    // Try custom string ID first
    let result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: id },
      { $set: { isAdvertised } }
    );
    
    // If not found and id looks like ObjectId, try ObjectId format
    if (result.matchedCount === 0 && ObjectId.isValid(id)) {
      result = await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: { isAdvertised } }
      );
    }
    
    return result.modifiedCount > 0;
  },

  getAdvertisedProperties: async (db) => {
    return db.collection(COLLECTION_NAME).find({ 
      isAdvertised: true, 
      verificationStatus: 'verified',
      status: { $ne: 'sold' }
    }).toArray();
  },

  getLatestAdvertisedProperties: async (db, limit) => {
    return db.collection(COLLECTION_NAME).find({ 
      isAdvertised: true, 
      verificationStatus: 'verified',
      status: { $ne: 'sold' }
    }).sort({ createdAt: -1 }).limit(limit).toArray();
  },

  searchPropertiesByLocation: async (db, location) => {
    return db.collection(COLLECTION_NAME).find({ 
      location: { $regex: location, $options: 'i' }, 
      verificationStatus: 'verified',
      status: { $ne: 'sold' }
    }).toArray();
  },

  sortPropertiesByPrice: async (db, order) => {
    return db.collection(COLLECTION_NAME).find({ 
      verificationStatus: 'verified',
      status: { $ne: 'sold' }
    }).sort({ 'priceRange.min': order }).toArray();
  },
};

module.exports = Property;