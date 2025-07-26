const { MongoClient } = require('mongodb');
require('dotenv').config();

const sampleProperties = [
  {
    _id: "property1",
    title: "Modern Downtown Apartment",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    priceRange: "$2,500 - $3,000",
    minPrice: 2500,
    maxPrice: 3000,
    agentUid: "agent1",
    agentName: "John Smith",
    agentEmail: "john@example.com",
    verificationStatus: "verified",
    isAdvertised: true,
    createdAt: new Date()
  },
  {
    _id: "property2", 
    title: "Luxury Beach House",
    location: "Miami, FL",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
    priceRange: "$5,000 - $6,000",
    minPrice: 5000,
    maxPrice: 6000,
    agentUid: "agent2",
    agentName: "Jane Doe",
    agentEmail: "jane@example.com",
    verificationStatus: "verified",
    isAdvertised: false,
    createdAt: new Date()
  },
  {
    _id: "property3",
    title: "Cozy Suburban Home",
    location: "Austin, TX",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
    priceRange: "$1,800 - $2,200",
    minPrice: 1800,
    maxPrice: 2200,
    agentUid: "agent3",
    agentName: "Mike Johnson",
    agentEmail: "mike@example.com",
    verificationStatus: "verified",
    isAdvertised: true,
    createdAt: new Date()
  }
];

// Sample users with different roles
const sampleUsers = [
  {
    uid: "agent1",
    email: "john@example.com",
    displayName: "John Smith",
    role: "agent",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    verificationStatus: "verified",
    isFraud: false,
    createdAt: new Date()
  },
  {
    uid: "agent2", 
    email: "jane@example.com",
    displayName: "Jane Doe",
    role: "agent",
    photoURL: "https://images.unsplash.com/photo-1494790108755-2616b25b2f12?w=100",
    verificationStatus: "verified",
    isFraud: false,
    createdAt: new Date()
  },
  {
    uid: "user1",
    email: "buyer@example.com", 
    displayName: "Alex Johnson",
    role: "user",
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    verificationStatus: "verified",
    isFraud: false,
    createdAt: new Date()
  }
];

// Sample offers
const sampleOffers = [
  {
    propertyId: "property1",
    propertyTitle: "Modern Downtown Apartment",
    propertyLocation: "New York, NY",
    agentUid: "agent1",
    agentName: "John Smith",
    buyerUid: "user1",
    buyerEmail: "buyer@example.com",
    buyerName: "Alex Johnson",
    offerAmount: 2800,
    buyingDate: new Date(),
    status: "pending",
    createdAt: new Date()
  },
  {
    propertyId: "property2",
    propertyTitle: "Luxury Beach House", 
    propertyLocation: "Miami, FL",
    agentUid: "agent2",
    agentName: "Jane Doe",
    buyerUid: "user1",
    buyerEmail: "buyer@example.com",
    buyerName: "Alex Johnson",
    offerAmount: 5500,
    buyingDate: new Date(),
    status: "accepted",
    createdAt: new Date()
  },
  {
    propertyId: "property3",
    propertyTitle: "Cozy Suburban Home",
    propertyLocation: "Austin, TX", 
    agentUid: "agent1",
    agentName: "John Smith",
    buyerUid: "user1",
    buyerEmail: "buyer@example.com",
    buyerName: "Alex Johnson",
    offerAmount: 2000,
    buyingDate: new Date(),
    status: "bought",
    createdAt: new Date()
  }
];

async function addSampleData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('real-estate-db');
    
    // Clear existing data
    await db.collection('properties').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('offers').deleteMany({});
    console.log('Cleared existing data');
    
    // Insert sample properties
    const propertiesResult = await db.collection('properties').insertMany(sampleProperties);
    console.log(`Inserted ${propertiesResult.insertedCount} properties`);
    
    // Insert sample users
    const usersResult = await db.collection('users').insertMany(sampleUsers);
    console.log(`Inserted ${usersResult.insertedCount} users`);
    
    // Insert sample offers
    const offersResult = await db.collection('offers').insertMany(sampleOffers);
    console.log(`Inserted ${offersResult.insertedCount} offers`);
    
    // Verify data
    const propertiesCount = await db.collection('properties').countDocuments({ verificationStatus: 'verified' });
    const usersCount = await db.collection('users').countDocuments({});
    const offersCount = await db.collection('offers').countDocuments({});
    
    console.log(`Total verified properties: ${propertiesCount}`);
    console.log(`Total users: ${usersCount}`);
    console.log(`Total offers: ${offersCount}`);
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await client.close();
  }
}

addSampleData();