import franchiseModel from "../models/franchise.model.js";
import  supplyRequestModel from "../models/supplyRequest.model.js";
import franchiseInventoryModel from "../models/franchiseInventory.model.js";
import  bcrypt from "bcryptjs"

// 1. Specialized Franchise Registration
export const registerFranchise = async (req, res) => {
  try {
    const {
      fullName, email, password, mobile, franchiseType,
      address, udyamNumber, bankDetails, panNumber, aadhaarNumber
    } = req.body;

    const existingUser = await franchiseModel.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Franchise already exists with this Email or Mobile" });
    }


    // Document URLs handled via File Upload Middleware (e.g. Multer/S3)
    const newFranchise = new franchiseModel({
      fullName,
      email,
      password: password,
      mobile,
      franchiseType,
      address,
      udyamNumber,
      firmDocsUrl: req.files?.firmDocs?.[0]?.path || req.body.firmDocsUrl,
      shopLicenseUrl: req.files?.shopLicense?.[0]?.path || req.body.shopLicenseUrl,
      panNumber,
      panCardImageUrl: req.files?.panCardImage?.[0]?.path || req.body.panCardImageUrl,
      aadhaarNumber,
      aadhaarCardImageUrl: req.files?.aadhaarCardImage?.[0]?.path || req.body.aadhaarCardImageUrl,
      bankDetails
    });

    await newFranchise.save();

    res.status(201).json({
      success: true,
      message: "Franchise registered successfully. Pending Admin verification.",
      franchiseId: newFranchise._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginFranchise = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const franchise = await franchiseModel.findOne({ email });
    if (!franchise) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Leverages Mongoose schema comparePassword method
    const isMatch = await franchise.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (franchise.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${franchise.status}. Contact Admin for verification.`
      });
    }

    // Attach role explicitly before issuing token
    franchise.role = "FRANCHISE";

    // Call unified token function
    return sendTokenResponse(franchise, res, "Franchise logged in successfully", 200);

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// 2. Fetch Franchise Profile & Overview
export const getFranchiseProfile = async (req, res) => {
  try {
    const franchise = await franchiseModel.findById(req.user.id).select("-password");
    if (!franchise) return res.status(404).json({ success: false, message: "Franchise not found" });

    const planConfig = FRANCHISE_TYPES[franchise.franchiseType];

    res.status(200).json({
      success: true,
      data: {
        profile: franchise,
        planBenefits: planConfig
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create Supply Request (Hierarchy-based Visibility)
export const createSupplyRequest = async (req, res) => {
  try {
    const { items } = req.body;
    const franchise = await franchiseModel.findById(req.user.id);

    let visibility = { district: false, state: false, admin: true };

    if (franchise.franchiseType === "VILLAGE") {
      visibility.district = true;
      visibility.state = true;
    } else if (franchise.franchiseType === "DISTRICT") {
      visibility.state = true;
    }

    const supplyRequest = new supplyRequestModel({
      requestNumber: `REQ-${Date.now()}`,
      requesterFranchise: franchise._id,
      requesterType: franchise.franchiseType,
      requesterLocation: franchise.address,
      items,
      visibleTo: visibility
    });

    await supplyRequest.save();

    res.status(201).json({ success: true, message: "Supply request submitted", supplyRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Fetch Supply Requests based on Hierarchy Role
export const getSupplyRequestsForHierarchy = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.user.id);
    let filter = {};

    if (franchise.franchiseType === "DISTRICT") {
      filter = {
        "visibleTo.district": true,
        "requesterLocation.district": franchise.address.district
      };
    } else if (franchise.franchiseType === "STATE") {
      filter = {
        "visibleTo.state": true,
        "requesterLocation.state": franchise.address.state
      };
    } else {
      // Village level views own requests only
      filter = { requesterFranchise: franchise._id };
    }

    const requests = await SupplyRequest.find(filter)
      .populate("requesterFranchise", "fullName mobile franchiseType address")
      .populate("items.productId", "name category price");

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Inventory Management (Sell from inventory / update stock)
export const getInventory = async (req, res) => {
  try {
    const inventory = await FranchiseInventory.find({ franchiseId: req.user.id })
      .populate("productId");
    res.status(200).json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sellFromInventory = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const inventoryItem = await FranchiseInventory.findOne({
      franchiseId: req.user.id,
      productId
    });

    if (!inventoryItem || inventoryItem.stock < quantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock in inventory" });
    }

    inventoryItem.stock -= quantity;
    await inventoryItem.save();

    // Trigger Commission Updates to Franchise Wallet
    const franchise = await Franchise.findById(req.user.id);
    const benefits = FRANCHISE_TYPES[franchise.franchiseType];

    let commissionEarned = 0;
    if (benefits.commPerProduct) {
      commissionEarned += benefits.commPerProduct * quantity;
    }
    if (benefits.commPercent) {
      commissionEarned += ((inventoryItem.sellingPrice * quantity) * benefits.commPercent) / 100;
    }

    franchise.wallet.totalCommission += commissionEarned;
    franchise.wallet.totalEarnings += commissionEarned;
    await franchise.save();

    res.status(200).json({
      success: true,
      message: "Sale processed successfully",
      remainingStock: inventoryItem.stock,
      commissionEarned
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Financial Overview (ROI, Rent, & Commissions)
export const getFinancialOverview = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.user.id).select("wallet franchiseType");
    const benefits = FRANCHISE_TYPES[franchise.franchiseType];

    res.status(200).json({
      success: true,
      financials: {
        wallet: franchise.wallet,
        fixedBenefits: {
          monthlyRoi: benefits.roi || 0,
          monthlyRent: benefits.rent || 0,
          commissionStructure: {
            perProduct: benefits.commPerProduct || 0,
            percent: benefits.commPercent || 0
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};