import mongoose from "mongoose";
import { config } from "./config/config.js";
import userModel from "./models/user.models.js";

// Helper to generate unique distributor ID
async function genrateUniqueDistributerId() {
  let uniqueId = "";
  let exists = true;

  while (exists) {
    uniqueId = `AGT${Math.floor(100000 + Math.random() * 900000)}`;
    const user = await userModel.findOne({ distributerId: uniqueId });
    if (!user) exists = false;
  }
  return uniqueId;
}

// Helper to generate dummy user payload with unique identity fields
const createDummyUserPayload = async (index, parentUser = null, position = null) => {
  const distributerId = await genrateUniqueDistributerId();
  const timestamp = Date.now();

  return {
    fullName: `Agent ${index}`,
    email: `agent${index}_${timestamp}@example.com`,
    contact: `98${Math.floor(10000000 + Math.random() * 90000000)}`, // Guaranteed unique contact
    password: "Password@123",
    role: "Agent",
    
    // FIX: Added unique PAN and Aadhaar numbers to avoid E11000 Duplicate Key Error
    panCardNumber: `ABCDE${String(1000 + index)}F`,
    adharCardNumber: `12345678${String(index).padStart(4, "0")}`,
    
    distributerId: distributerId,
    position: position,
    parentAgentId: parentUser ? parentUser._id : null,
    sponserId: parentUser ? parentUser.distributerId : "DIRECT",
    sponserName: parentUser ? parentUser.fullName : "system",
    parrentAgentName: parentUser ? parentUser.fullName : "system",

    // 5000 BV Points
    leftBV: 5000,
    rightBV: 5000,
    totalLeftBV: 5000,
    totalRightBV: 5000,

    walletBalance: 0,
    totalEarning: 0,
    leftChild: null,
    rightChild: null,
  };
};

/**
 * Binary Subtree Inserter (Generates 'count' users under 'rootNode' at 'startPosition')
 */
const seedSubtree = async (rootNode, startPosition, count, startIndex) => {
  console.log(`[SEED] Generating ${count} users in ${startPosition.toUpperCase()} subtree...`);

  // 1. Create First Node under Root on designated position
  const firstChildPayload = await createDummyUserPayload(startIndex, rootNode, startPosition);
  const firstChild = await userModel.create(firstChildPayload);

  // Link first child to Root Node
  if (startPosition === "left") {
    rootNode.leftChild = firstChild._id;
  } else {
    rootNode.rightChild = firstChild._id;
  }
  await rootNode.save();

  console.log(`[SEED] Created ${startPosition} branch root: ${firstChild.fullName} (${firstChild.distributerId})`);

  // Queue to maintain Binary Tree insertion order (BFS)
  const queue = [firstChild];
  let createdCount = 1;
  let currentIndex = startIndex + 1;

  // 2. Loop to fill remaining nodes in Binary Tree structure
  while (queue.length > 0 && createdCount < count) {
    const parentNode = queue.shift();

    // Attach Left Child if slots remain
    if (createdCount < count) {
      const leftPayload = await createDummyUserPayload(currentIndex, parentNode, "left");
      const leftChild = await userModel.create(leftPayload);

      parentNode.leftChild = leftChild._id;
      await parentNode.save();

      queue.push(leftChild);
      createdCount++;
      currentIndex++;
      console.log(`  └─ Added Left Child: ${leftChild.fullName} under Parent: ${parentNode.fullName}`);
    }

    // Attach Right Child if slots remain
    if (createdCount < count) {
      const rightPayload = await createDummyUserPayload(currentIndex, parentNode, "right");
      const rightChild = await userModel.create(rightPayload);

      parentNode.rightChild = rightChild._id;
      await parentNode.save();

      queue.push(rightChild);
      createdCount++;
      currentIndex++;
      console.log(`  └─ Added Right Child: ${rightChild.fullName} under Parent: ${parentNode.fullName}`);
    }
  }
};

/**
 * Main Seeding Controller Function
 */
export const seedMLMUsers = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("=== [DATABASE CONNECTED FOR SEEDING] ===");

    // 1. Create Root Agent
    console.log("[SEED] Creating Root Agent...");
    const rootPayload = await createDummyUserPayload(1, null, null);
    rootPayload.fullName = "Main Root Agent";
    const rootUser = await userModel.create(rootPayload);
    console.log(`✅ Root Agent Created: ${rootUser.fullName} (${rootUser.distributerId})`);

    // 2. Seed 25 Users in Left Subtree (Index 2 to 26)
    await seedSubtree(rootUser, "left", 25, 2);

    // 3. Seed 25 Users in Right Subtree (Index 27 to 51)
    await seedSubtree(rootUser, "right", 25, 27);

    console.log("\n=======================================================");
    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
    console.log("Total Users Created: 51 (1 Root + 25 Left + 25 Right)");
    console.log("All users configured with 5000 BV points each.");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ [SEEDING ERROR]:", error);
    process.exit(1);
  }
};

seedMLMUsers();