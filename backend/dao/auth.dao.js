import userModel from "../models/user.models.js"; 
import adminModel from "../models/admin.model.js";

/**
 * Checks if a user already exists with the given email or contact number.
 */
export const findExistingUserByEmailOrContact = async (email, contact) => {
  return await userModel.findOne({
    $or: [{ email }, { contact }]
  });
};

/**
 * Counts the total number of documents with the 'Agent' role.
 */
export const getAgentCount = async () => {
  return await userModel.countDocuments({ role: "Agent" });
};

/**
 * Finds a parent agent using their public distributor ID string.
 */
export const findParentByDistributorId = async (distributorId) => {
  return await userModel.findOne({ distributerId: distributorId.trim() });
};

/**
 * Checks if a specific position slot (left/right) under a parent ID is already taken.
 */
export const checkSlotOccupation = async (parentId, position) => {
  return await userModel.findOne({
    parentAgentId: parentId,
    position: position
  });
};

/**
 * Persists a new agent payload directly inside the DB collection state layer.
 */
export const createAgentRecord = async (agentPayload) => {
  return await userModel.create(agentPayload);
};

export const updateParentChildSlot = async (parentId, position, childId) => {
  const updateField = position === "left" ? { leftChild: childId } : { rightChild: childId };
  return await userModel.findByIdAndUpdate(parentId, updateField, { returnDocument: 'after' });
};

export const incrementSponsorDirectCount = async (sponsorId) => {
  return await userModel.findOneAndUpdate(
    { distributerId: sponsorId },
    { $inc: { totalDirects: 1 } }
  );
};
export const updateAllUplinesCounters = async (currentParentId, incomingPosition, assignedBV = 0) => {
  let currentId = currentParentId;
  let lastPosition = incomingPosition; // "left" or "right"

  // Loop tab tak chalega jab tak top root node nahi aa jata
  while (currentId) {
    const uplineUser = await userModel.findById(currentId);
    if (!uplineUser) break;

    const incrementPayload = {};
    
    // Naye node ki position ke hisab se upline ka counter set karein
    if (lastPosition === "left") {
      incrementPayload.totalLeftAgents = 1;
      incrementPayload.activeLeftAgents = 1; 
      if (assignedBV > 0) {
        incrementPayload.leftBV = assignedBV;
        incrementPayload.totalLeftBV = assignedBV;
      }
    } else {
      incrementPayload.totalRightAgents = 1;
      incrementPayload.activeRightAgents = 1;
      if (assignedBV > 0) {
        incrementPayload.rightBV = assignedBV;
        incrementPayload.totalRightBV = assignedBV;
      }
    }

    // Upline document ko update karein
    await userModel.findByIdAndUpdate(currentId, { $inc: incrementPayload });

    // Agle iteration ke liye track badlein: upar wale upline ke liye current user khud kis side par tha
    lastPosition = uplineUser.position; 
    currentId = uplineUser.parentAgentId; // Move one step up
  }
};

export const findUserByIdentifier = async (cleanInput, rawInput) => {
  // Common query conditions
  const queryConditions = [
    { email: cleanInput },
    { distributerId: rawInput.toUpperCase() }
  ];

  // Prevent numeric string indexing issues
  if (!isNaN(rawInput) && rawInput.trim() !== "") {
    queryConditions.push({ contact: Number(rawInput) });
  }

  const query = { $or: queryConditions };

  // 1. Dono collections mein ek saath search karein (Parallel Query)
  const [adminUser, agentUser] = await Promise.all([
    adminModel.findOne(query),
    userModel.findOne(query)
  ]);

  // 2. Agar Admin collection mein mil jaye toh use return karein
  if (adminUser) {
    return adminUser; // mongoose document retains its role and model metadata
  }

  // 3. Warna Agent collection ka result return karein (chahe agent mile ya null)
  return agentUser;
};


