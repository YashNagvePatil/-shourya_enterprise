import axios from "axios";
import { config } from "../config/config.js";

/**
 * RazorpayX REST API Basic Auth Header Generator
 * Note: Yeh aapke backend authMiddleware se alag hai.
 * Yeh Header Razorpay server ko authorize karta hai.
 */
const getAuthHeader = () => {
  const keyId = config.RAZORPAY_TEST_API_KEY;
  const keySecret = config.RAZORPAY_KEY_SECRET;
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${token}`;
};

/**
 * HELPER 1: Agent ke details se Razorpay Contact & Fund Account Create / Get karna
 */
export const getOrCreateFundAccountId = async (agent) => {
  // 1. Agar DB me pehle se fundAccountId saved hai, toh wahi return karein
  if (agent.razorpayFundAccountId) {
    return agent.razorpayFundAccountId;
  }

  // 2. Razorpay Contact Create Karein
  const contactResponse = await axios.post(
    "https://api.razorpay.com/v1/contacts",
    {
      name: agent.bankDetails?.accountHolderName || agent.fullName,
      email: agent.email || "agent@example.com",
      contact: String(agent.contact || "9999999999"),
      type: "employee",
    },
    {
      headers: { Authorization: getAuthHeader() },
    }
  );

  const contactId = contactResponse.data.id;

  // 3. Fund Account Payload Prepare Karein
  let fundAccountPayload = {
    contact_id: contactId,
    account_type: agent.bankDetails?.upiId ? "vpa" : "bank_account",
  };

  if (agent.bankDetails?.upiId) {
    fundAccountPayload.vpa = { address: agent.bankDetails.upiId };
  } else if (agent.bankDetails?.accountNumber && agent.bankDetails?.ifscCode) {
    fundAccountPayload.bank_account = {
      name: agent.bankDetails.accountHolderName || agent.fullName,
      ifsc: agent.bankDetails.ifscCode,
      account_number: agent.bankDetails.accountNumber,
    };
  } else {
    throw new Error("Agent does not have valid Bank Account or UPI ID details.");
  }

  // 4. Razorpay Fund Account Create Karein
  const fundAccountResponse = await axios.post(
    "https://api.razorpay.com/v1/fund_accounts",
    fundAccountPayload,
    {
      headers: { Authorization: getAuthHeader() },
    }
  );

  const fundAccountId = fundAccountResponse.data.id;

  // 5. Future Payouts ke liye Agent Record me Save Karein
  agent.razorpayFundAccountId = fundAccountId;
  await agent.save();

  return fundAccountId;
};

/**
 * HELPER 2: Direct Razorpay Payout Execute karna
 */
export const executeRazorpayPayout = async (fundAccountId, amount, referenceId, mode = "IMPS") => {
  try {
    const payoutResponse = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      {
        account_number: config.RAZORPAYX_ACCOUNT_NUMBER || "23344556677889",
        fund_account_id: fundAccountId,
        amount: Math.round(amount * 100), // Rupees to Paise
        currency: "INR",
        mode: mode, // Dynamic mode: "UPI", "IMPS", ya "NEFT"
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: referenceId,
        narration: "Agent Wallet Withdrawal",
      },
      {
        headers: { Authorization: getAuthHeader() },
      }
    );

    return payoutResponse.data;
  } catch (error) {
    // Razorpay dwara bheja gaya exact error terminal par print karein
    if (error.response) {
      console.error(
        "Razorpay API Error Payload:",
        JSON.stringify(error.response.data, null, 2)
      );
      throw new Error(
        error.response.data?.error?.description || "Razorpay Payout API Failed"
      );
    }
    throw error;
  }
};