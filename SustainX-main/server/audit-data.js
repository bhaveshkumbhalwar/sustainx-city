const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sustainx_test').then(async () => {
  const BinReading = require('./models/BinReading');
  const SmartBin = require('./models/SmartBin');
  const Complaint = require('./models/Complaint');
  const BinData = require('./models/BinData');
  const Device = require('./models/Device');
  
  const readingsCount = await BinReading.countDocuments({});
  const binsCount = await SmartBin.countDocuments({});
  const complaintsCount = await Complaint.countDocuments({});
  const binDataCount = await BinData.countDocuments({});
  const devicesCount = await Device.countDocuments({});
  
  console.log('=== DATA COUNTS ===');
  console.log('BinReading:', readingsCount);
  console.log('SmartBin:', binsCount);
  console.log('Complaint:', complaintsCount);
  console.log('BinData:', binDataCount);
  console.log('Device:', devicesCount);
  
  const sampleReadings = await BinReading.find().limit(5).sort({readAt: -1}).lean();
  console.log('\n=== SAMPLE READINGS ===');
  console.log(JSON.stringify(sampleReadings, null, 2));
  
  const sampleBins = await SmartBin.find().limit(5).lean();
  console.log('\n=== SAMPLE BINS ===');
  console.log(JSON.stringify(sampleBins, null, 2));
  
  const sampleComplaints = await Complaint.find().limit(5).lean();
  console.log('\n=== SAMPLE COMPLAINTS ===');
  console.log(JSON.stringify(sampleComplaints, null, 2));
  
  const oldestReading = await BinReading.findOne().sort({readAt: 1}).lean();
  const newestReading = await BinReading.findOne().sort({readAt: -1}).lean();
  console.log('\n=== TIME SPAN ===');
  console.log('Oldest reading:', oldestReading?.readAt);
  console.log('Newest reading:', newestReading?.readAt);
  
  const binCounts = await BinReading.aggregate([
    { $group: { _id: '$binId', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('\n=== READINGS PER BIN ===');
  console.log(JSON.stringify(binCounts, null, 2));
  
  const missingFields = await BinReading.aggregate([
    { $project: { 
      binId: 1, 
      level: 1, 
      temperature: 1, 
      signal: 1, 
      readAt: 1,
      hasLevel: { $cond: [{ $eq: ['$level', null] }, 1, 0] },
      hasTemp: { $cond: [{ $eq: ['$temperature', null] }, 1, 0] },
      hasSignal: { $cond: [{ $eq: ['$signal', null] }, 1, 0] }
    }},
    { $group: { 
      _id: null, 
      total: { $sum: 1 },
      missingLevel: { $sum: '$hasLevel' },
      missingTemp: { $sum: '$hasTemp' },
      missingSignal: { $sum: '$hasSignal' }
    }}
  ]);
  console.log('\n=== MISSING VALUES IN READINGS ===');
  console.log(JSON.stringify(missingFields, null, 2));
  
  const priorityDist = await Complaint.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('\n=== COMPLAINT PRIORITY DISTRIBUTION ===');
  console.log(JSON.stringify(priorityDist, null, 2));
  
  const typeDist = await Complaint.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('\n=== COMPLAINT TYPE DISTRIBUTION ===');
  console.log(JSON.stringify(typeDist, null, 2));
  
  const statusDist = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('\n=== COMPLAINT STATUS DISTRIBUTION ===');
  console.log(JSON.stringify(statusDist, null, 2));
  
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });