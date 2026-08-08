import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken"; 


async function sendTokenResponse(user, res, message) {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set HTTP-Only Cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:"lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(201).json({
    message,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullName: user.fullName,
      role: user.role,
      distributerId: user.distributerId, // New agent id
      parentAgentName: user.parrentAgentName,
      parentAgentId: user.parentAgentId
    }
  });

  
}
    // Uniqe Agent Id Genrator Safety Net  

  async function genrateUniqueDistributerId(){
    let uniqueId = "";
    let exists = true;

     // loop for finding uniq id 

     while (exists){
      uniqueId = `AGT${Math.floor(100000 + Math.random() * 900000)}`;
      const user = await userModel.findOne({distributerId:uniqueId});
      if(!user) exists = false;
      
       }
        return uniqueId ;
     }

// --- Register Controller ---


export const register = async (req,res) =>{
  const {
    email,
    contact,
    password,
    fullName,
    role,
    panCardNumber,
    adharCardNumber,
    parentAgentId,   // parrent agent id form form 
    parrentAgentName,
    position
  } = req.body;

  console.log(`[DEBUG] Registration Attempt for: ${email} | Role: ${role}`)

  try{
     // SAFETY NET 1:Required Fields Check
     if(!email || !contact || !password || !fullName){
      return res.status(400).json({
         success:false,
         message:"Please fill all mandatory fields (Name ,Email,Contact,Password)"
      })
     }
  
 
      const cleanEmail = email.toLowerCase().trim();

      // SAFTY NET  2: Duplicate Email or Phone Check 

      const existstingUser = await userModel.findOne({
        $or:[
          {email:cleanEmail} ,{contact}
        ]
      })

      if(existstingUser){
        console.warn(`[DEBUG] Duplicate User Blocked: ${cleanEmail} / ${contact}`)
        return res.status(400).json({
          success:false,
          message: "Email or Contact number already registered!"
        })
      }

      let parentuser = null;
      let finalPosition = null;
      const isTargetAgent = (role !== "Admin")

      if(isTargetAgent){
        const totalAgentCount = await userModel.countDocuments({role:"Agent"});
        if (totalAgentCount === 0){
          // CASE A FOR FIRST AGENT
          console.log("[DEBUG] No agents in DB. Creating First Root Agent...")
          parentuser = null,
          finalPosition = null;
        }
          else{      
            
            finalPosition = position === "left" ? "left" : "right"
            // CASE B: NORMAL AGENT REGISTRATION
            if(!parentAgentId){
              return res.status(400).json({
                success:false,
                message:"Parent Agent ID is required for registration!"
              })
            } 
         
            // verify if Prent Agent exists 

           parentuser = await userModel.findOne({distributerId:parentAgentId.trim()})

           if(!parentuser){
            console.warn(`[DEBUG] Invalid Parent Agent ID: ${parentAgentId}`)
            return res.status(404).json({
              success:false,
              Message:"Invalid Agent ID! Parent Agent does not exist. "
            })
           }
        

             // SAFETY NET 3: Slot Collision Check (Binary Tree Protection)

             const targetPostion = position === "left" ? "left" : "right";
             const isslotOccupied = await userModel.findone({
              parentAgentId:parentuser._id,
              position:targetPostion
             })

             if(isslotOccupied){
              console.warn(`[DEBUG] Slot Conflict: ${parentAgentId} -> ${targetPostion} is already taken!`)
              return res.status(400).json({
                success:false,
                message:`The ${targetPostion.toUpperCase()} slot under ${parentAgentId} is already occupied !`
              })
             }
          }
      }


        // SAFETY NET 4: Generate Guaranteed Unique Agent ID

        const newDistributedId = await genrateUniqueDistributerId();
        console.log(`[DEBUG] New Agent ID Generated: ${newDistributedId}`);

        // Create user Document 

        const user = await userModel.create({
            email:cleanEmail,
            contact,
            password,
            fullName: fullName.trim(),
            adharCardNumber:adharCardNumber ,
            panCardNumber:panCardNumber ,
            distributerId:newDistributedId,
            role:role === "Admin" ? "Admin" : "Agent",
            position:role === "Admin" ? null : finalPosition,
            parentAgentId:parentuser?parentuser._id :null,
            sponserId:parentuser ? parentuser.distributerId : "DIRECT",
            sponserName:parentuser ? parentuser.fullName : "systme",
            parrentAgentName:parentuser ? parentuser.fullName : (parrentAgentName || "systme") ,
            
            leftBV: 0,
            rightBV: 0,
            walletBalance: 0,
            totalMatchingBonus: 0,
            totalDirectBonus: 0
        })
  
        console.log(` [DEBUG] Registration Successful! Created User ID: ${user._id}`);

        return await sendTokenResponse(user,res," Registration Successful!")
  }

      catch (error) {
        return res.status(500).json({
          success:false,
          message:"Server Error during registration",
          error:error.message
        })
      }
}
