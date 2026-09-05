import  mongoose  from "mongoose"

const supplyRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, unique: true },
    requesterFranchise: { type: mongoose.Schema.Types.ObjectId, ref: "Franchise", required: true },
    requesterType: { type: String, enum: ["VILLAGE", "CITY", "DISTRICT", "STATE"], required: true },
    requesterLocation: {
      state: String,
      district: String,
      city: String,
      village: String
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 }
      }
    ],
    totalAmount: { type: Number, default: 0 },
    // Hierarchical Access Controls
    visibleTo: {
      city: { type: Boolean, default: false },
      district: { type: Boolean, default: false },
      state: { type: Boolean, default: false },
      admin: { type: Boolean, default: true }
    },
    status: {
      type: String,
      enum: ["Pending", "Dispatched", "Received", "Fulfilled", "Rejected", "Cancelled"],
      default: "Pending"
    },
    // Who fulfilled/dispatched this request
    fulfilledBy: { 
      type: String, 
      enum: ["CITY", "DISTRICT", "STATE", "ADMIN", null], 
      default: null 
    },
    // Reference to the franchise that fulfilled (if not admin)
    fulfilledByFranchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      default: null
    },
    adminNotes: { type: String, default: "" },
    dispatchNotes: { type: String, default: "" },
    dispatchedAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const supplyRequestModel = mongoose.model("SupplyRequest", supplyRequestSchema);
 
export default supplyRequestModel