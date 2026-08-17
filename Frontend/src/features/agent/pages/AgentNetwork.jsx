import React, { useEffect } from "react";
import { User, ShieldCheck, Award, Users, GitCommit, Network, Loader2 } from "lucide-react";
import { useAgentNetwork } from "../hook/useAgent"; 

// Reusable Tree Node UI Card Component (Fixed Mapping to leftChild/rightChild)
const TreeNodeCard = ({ node, fallBackSide }) => {
  // If the data is empty or node doesn't exist, we render a clear "Vacant Slot" card
  const isEmpty = !node || node.rank === "Empty" || node.rank === "Vacant Slot";
  const displayRank = isEmpty ? "Vacant" : (node.rank || "Agent");

  return (
    <div className="flex flex-col items-center flex-1 mx-2">
      <div className={`w-40 p-3 rounded-xl border text-center transition shadow-sm bg-white ${
        isEmpty 
          ? 'border-dashed border-slate-300 bg-slate-50/50 opacity-70' 
          : 'border-slate-200 hover:border-slate-900'
      }`}>
        <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2 ${
          isEmpty ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'
        }`}>
          <User className="w-4 h-4" />
        </div>
        
        <h4 className="text-xs font-semibold text-slate-900 truncate">
          {isEmpty ? "Vacant Slot" : (node.fullName || node.name)}
        </h4>
        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
          {isEmpty ? "---" : (node.distributerId || node.id || "---")}
        </p>
        
        <div className="mt-2 flex items-center justify-center space-x-1">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
            isEmpty 
              ? 'bg-slate-200/60 text-slate-500' 
              : displayRank.includes('Pro') || displayRank.includes('Gold')
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'bg-slate-100 text-slate-700'
          }`}>
            {displayRank}
          </span>
          {fallBackSide && (
            <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-1 rounded">
              {fallBackSide}
            </span>
          )}
        </div>
      </div>
      
      {/* Visual vertical connector handler line below active nodes */}
      {!isEmpty && (node.leftChild || node.rightChild) && (
        <div className="w-0.5 h-6 bg-slate-200 relative">
          <div className="absolute bottom-0 w-4 h-4 bg-slate-50 rounded-full border border-slate-200 -translate-x-1/2 translate-y-1/2 flex items-center justify-center">
            <GitCommit className="w-2 h-2 text-slate-300" />
          </div>
        </div>
      )}
    </div>
  );
};

const AgentNetwork = () => {
  const { binaryStats, treeNodes, isLoading, error, fetchNetworkTree } = useAgentNetwork();

  useEffect(() => {
    fetchNetworkTree();
  }, [fetchNetworkTree]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50/50 space-y-3">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <p className="text-xs font-medium text-slate-500 tracking-wide">Mapping live genealogy nodes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs max-w-md text-center shadow-sm">
          <p className="font-semibold">Network Sync Failed</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  if (!treeNodes) return null;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 font-sans text-slate-800 select-none overflow-x-auto">
      <div className="max-w-6xl mx-auto space-y-6 min-w-[900px]">
        
        {/* HEADER STATS PANEL */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Network Genealogy Matrix</h1>
            <p className="text-xs text-slate-500">Visual mapping of your binary direct channels and downline node hierarchy.</p>
          </div>
          
          <div className="flex items-center space-x-4 bg-white border border-slate-200 rounded-lg p-2 px-3 text-xs font-medium shadow-sm">
            <span className="flex items-center text-slate-600">
              <Users className="w-4 h-4 mr-1.5 text-slate-400" /> 
              Active Team: <strong className="ml-1 text-slate-900">{binaryStats?.activeLeftAgents + binaryStats?.activeRightAgents || 0} Agents</strong>
            </span>
            <span className="w-px h-3 bg-slate-200"></span>
            <span className="flex items-center text-slate-600">
              <Network className="w-4 h-4 mr-1.5 text-slate-400" /> 
              Structure: <strong className="ml-1 text-slate-900">Binary</strong>
            </span>
          </div>
        </div>

        {/* VISUAL GENEALOGY CANVAS MAP */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col items-center">
          
          {/* LEVEL 1: ROOT NODE */}
          <div className="flex justify-center w-full relative">
            <TreeNodeCard node={treeNodes} fallBackSide="Root" />
          </div>
          
          {/* Main Root Connecting Horizontal Line */}
          <div className="w-1/2 h-px bg-slate-200 my-0.5 mt-5"></div>

          {/* LEVEL 2 & 3: RENDERING DEEP CHANNELS (Using leftChild & rightChild) */}
          <div className="flex justify-between w-full mt-1.5">
            
            {/* Left Main Branch */}
            <div className="flex flex-col items-center flex-1">
              <TreeNodeCard node={treeNodes.leftChild} fallBackSide="Left Leg" />
              
              {/* Branch Line connecting to Level 3 Left */}
              {treeNodes.leftChild && <div className="w-1/2 h-px bg-slate-200 my-0.5 mt-5"></div>}
              
              {/* LEVEL 3: SUB-MEMBERS UNDER LEFT */}
              {treeNodes.leftChild && (
                <div className="flex justify-between w-full mt-1.5">
                  <TreeNodeCard node={treeNodes.leftChild.leftChild} fallBackSide="L-Left" />
                  <TreeNodeCard node={treeNodes.leftChild.rightChild} fallBackSide="L-Right" />
                </div>
              )}
            </div>

            {/* Right Main Branch */}
            <div className="flex flex-col items-center flex-1">
              <TreeNodeCard node={treeNodes.rightChild} fallBackSide="Right Leg" />
              
              {/* Branch Line connecting to Level 3 Right */}
              {treeNodes.rightChild && <div className="w-1/2 h-px bg-slate-200 my-0.5 mt-5"></div>}
              
              {/* LEVEL 3: SUB-MEMBERS UNDER RIGHT */}
              {treeNodes.rightChild && (
                <div className="flex justify-between w-full mt-1.5">
                  <TreeNodeCard node={treeNodes.rightChild.leftChild} fallBackSide="R-Left" />
                  <TreeNodeCard node={treeNodes.rightChild.rightChild} fallBackSide="R-Right" />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* UPDATE PERFORMANCE TARGET */}
        <div className="bg-slate-950 text-white rounded-xl p-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide">Next Milestone Promotion Target</h3>
              <p className="text-[11px] text-slate-400 font-light mt-0.5">
                Maintain active balance scores. Left BV: <span className="text-emerald-400 font-mono font-medium">{binaryStats?.leftBV || 0}</span> | Right BV: <span className="text-emerald-400 font-mono font-medium">{binaryStats?.rightBV || 0}</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-white/15 px-2.5 py-1 rounded-md font-medium tracking-wider uppercase border border-white/5">Auto Balance ON</span>
        </div>

      </div>
    </div>
  );
};

export default AgentNetwork;