import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Award, Users, GitCommit, Network, Loader2, ArrowLeft } from "lucide-react";
import { useAgentNetwork } from "../hook/useAgent"; 

// Reusable Tree Node UI Card Component
const TreeNodeCard = ({ node, fallBackSide }) => {
  // Check if node exists or is marked vacant
  const isEmpty = !node || node.rank === "Empty" || node.rank === "Vacant Slot";
  const displayRank = isEmpty ? "Vacant" : (node.rank || "Agent");

  return (
    <div className="flex flex-col items-center flex-1 mx-2">
      <div 
        className={`w-44 p-3.5 rounded-xl border text-center transition-all duration-300 shadow-sm ${
          isEmpty 
            ? 'border-dashed border-[#F59E35]/40 bg-[#2A1815]/5 opacity-60' 
            : 'border-[#F59E35]/30 bg-[#2A1815] text-[#FAF5EE] hover:border-[#F59E35] shadow-md hover:-translate-y-0.5'
        }`}
      >
        {/* User Icon Avatar */}
        <div 
          className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
            isEmpty 
              ? 'bg-[#2A1815]/10 text-[#2A1815]/40' 
              : 'bg-[#DC2643] text-[#FAF5EE] shadow-xs'
          }`}
        >
          <User className="w-4 h-4" />
        </div>
        
        {/* Agent Name */}
        <h4 className={`text-xs font-medium truncate ${isEmpty ? 'text-[#2A1815]/60' : 'text-[#FAF5EE]'}`}>
          {isEmpty ? "Vacant Slot" : (node.fullName || node.name)}
        </h4>

        {/* Distributor ID */}
        <p className={`text-[10px] font-mono mt-0.5 ${isEmpty ? 'text-[#2A1815]/40' : 'text-[#FAF5EE]/60'}`}>
          {isEmpty ? "---" : (node.distributerId || node.id || "---")}
        </p>
        
        {/* Badges Section */}
        <div className="mt-2.5 flex items-center justify-center space-x-1.5">
          <span 
            className={`text-[9px] px-2 py-0.5 rounded-full font-medium tracking-wide ${
              isEmpty 
                ? 'bg-[#2A1815]/10 text-[#2A1815]/60' 
                : displayRank.toLowerCase().includes('pro') || displayRank.toLowerCase().includes('gold')
                  ? 'bg-[#F59E35] text-[#2A1815] font-semibold'
                  : 'bg-white/10 text-[#FAF5EE]/90 border border-white/10'
            }`}
          >
            {displayRank}
          </span>

          {fallBackSide && (
            <span className="text-[9px] text-[#2A1815]/70 bg-[#F59E35]/20 border border-[#F59E35]/30 px-1.5 py-0.5 rounded-full font-mono">
              {fallBackSide}
            </span>
          )}
        </div>
      </div>
      
      {/* Visual vertical connector line below active root/branch nodes */}
      {!isEmpty && (node.leftChild || node.rightChild) && (
        <div className="w-0.5 h-6 bg-[#F59E35]/40 relative">
          <div className="absolute bottom-0 w-4 h-4 bg-[#FAF5EE] rounded-full border border-[#F59E35]/60 -translate-x-1/2 translate-y-1/2 flex items-center justify-center shadow-xs">
            <GitCommit className="w-2.5 h-2.5 text-[#DC2643]" />
          </div>
        </div>
      )}
    </div>
  );
};

const AgentNetwork = () => {
  const navigate = useNavigate();
  const { binaryStats, treeNodes, isLoading, error, fetchNetworkTree } = useAgentNetwork();

  useEffect(() => {
    fetchNetworkTree();
  }, [fetchNetworkTree]);

  // Loading Screen Theme
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#FAF5EE] space-y-3">
        <Loader2 className="w-9 h-9 text-[#DC2643] animate-spin" />
        <p className="text-xs font-light text-[#2A1815]/70 tracking-widest uppercase">
          Mapping live genealogy nodes...
        </p>
      </div>
    );
  }

  // Error Screen Theme
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#FAF5EE] p-6">
        <div className="bg-[#DC2643]/10 border border-[#DC2643]/30 text-[#DC2643] px-6 py-4 rounded-xl text-xs max-w-md text-center shadow-sm">
          <p className="font-semibold text-sm">Network Sync Failed</p>
          <p className="mt-1 font-light opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  if (!treeNodes) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF5EE] p-6 font-sans text-[#2A1815] select-none overflow-x-auto">
      <div className="max-w-6xl mx-auto space-y-6 min-w-[920px]">
        
        {/* HEADER STATS PANEL */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* BACK TO DASHBOARD BUTTON */}
            <button
              onClick={() => navigate("/agent/dashboard")}
              className="p-2.5 bg-[#2A1815] text-[#FAF5EE] hover:bg-[#DC2643] rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2A1815] tracking-tight">Network Genealogy Matrix</h1>
              <p className="text-xs text-[#2A1815]/70 font-light">Visual mapping of your binary direct channels and downline node hierarchy.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-[#2A1815] text-[#FAF5EE] border border-[#F59E35]/30 rounded-xl p-2.5 px-4 text-xs font-light shadow-sm">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-[#F59E35]" /> 
              Active Team: <strong className="ml-1.5 text-[#FAF5EE] font-normal">{(binaryStats?.activeLeftAgents || 0) + (binaryStats?.activeRightAgents || 0)} Agents</strong>
            </span>
            <span className="w-px h-3 bg-[#F59E35]/30"></span>
            <span className="flex items-center">
              <Network className="w-4 h-4 mr-2 text-[#DC2643]" /> 
              Structure: <strong className="ml-1.5 text-[#FAF5EE] font-normal">Binary Leg</strong>
            </span>
          </div>
        </div>

        {/* VISUAL GENEALOGY CANVAS MAP */}
        <div className="bg-[#FFFDF9] border border-[#F59E35]/20 rounded-2xl p-8 shadow-sm flex flex-col items-center">
          
          {/* LEVEL 1: ROOT NODE */}
          <div className="flex justify-center w-full relative">
            <TreeNodeCard node={treeNodes} fallBackSide="Root" />
          </div>
          
          {/* Main Root Connecting Horizontal Line */}
          <div className="w-1/2 h-px bg-[#F59E35]/30 my-0.5 mt-5"></div>

          {/* LEVEL 2 & 3: RENDERING DEEP CHANNELS */}
          <div className="flex justify-between w-full mt-1.5">
            
            {/* Left Main Branch */}
            <div className="flex flex-col items-center flex-1">
              <TreeNodeCard node={treeNodes?.leftChild} fallBackSide="Left Leg" />
              
              {/* Branch Line connecting to Level 3 Left */}
              {treeNodes?.leftChild && <div className="w-1/2 h-px bg-[#F59E35]/30 my-0.5 mt-5"></div>}
              
              {/* LEVEL 3: SUB-MEMBERS UNDER LEFT */}
              {treeNodes?.leftChild && (
                <div className="flex justify-between w-full mt-1.5">
                  <TreeNodeCard node={treeNodes.leftChild?.leftChild} fallBackSide="L-Left" />
                  <TreeNodeCard node={treeNodes.leftChild?.rightChild} fallBackSide="L-Right" />
                </div>
              )}
            </div>

            {/* Right Main Branch */}
            <div className="flex flex-col items-center flex-1">
              <TreeNodeCard node={treeNodes?.rightChild} fallBackSide="Right Leg" />
              
              {/* Branch Line connecting to Level 3 Right */}
              {treeNodes?.rightChild && <div className="w-1/2 h-px bg-[#F59E35]/30 my-0.5 mt-5"></div>}
              
              {/* LEVEL 3: SUB-MEMBERS UNDER RIGHT */}
              {treeNodes?.rightChild && (
                <div className="flex justify-between w-full mt-1.5">
                  <TreeNodeCard node={treeNodes.rightChild?.leftChild} fallBackSide="R-Left" />
                  <TreeNodeCard node={treeNodes.rightChild?.rightChild} fallBackSide="R-Right" />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* UPDATE PERFORMANCE TARGET BANNER */}
        <div className="bg-[#2A1815] text-[#FAF5EE] rounded-xl p-4 flex items-center justify-between border border-[#F59E35]/30 shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-lg bg-[#F59E35]/20 text-[#F59E35]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide">Next Milestone Promotion Target</h3>
              <p className="text-[11px] text-[#FAF5EE]/70 font-light mt-0.5">
                Maintain active balance scores. Left BV: <span className="text-[#F59E35] font-mono font-medium">{binaryStats?.leftBV || 0}</span> | Right BV: <span className="text-[#F59E35] font-mono font-medium">{binaryStats?.rightBV || 0}</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-[#DC2643] text-[#FAF5EE] px-3 py-1 rounded-full font-light tracking-wider uppercase">
            Auto Balance Active
          </span>
        </div>

      </div>
    </div>
  );
};

export default AgentNetwork;