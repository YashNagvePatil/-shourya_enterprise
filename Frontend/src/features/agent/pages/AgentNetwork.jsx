import React from "react";
import { User, ShieldCheck, Award, Users, GitCommit, Network } from "lucide-react";

// STATIC STRUCTURAL DATA FOR BINARY GENEALOGY
const TREE_DATA = {
  id: "AGT-0001",
  name: "You (Root Node)",
  rank: "Diamond Pro",
  side: "Center",
  left: {
    id: "AGT-0024",
    name: "Rahul Sharma",
    rank: "Gold Agent",
    side: "Left Channel",
    left: { id: "AGT-0102", name: "Amit Patel", rank: "Active", side: "Left" },
    right: { id: "AGT-0109", name: "Sonia Das", rank: "Active", side: "Right" }
  },
  right: {
    id: "AGT-0025",
    name: "Priyanka Verma",
    rank: "Silver Agent",
    side: "Right Channel",
    left: { id: "AGT-0211", name: "Vikas Kumar", rank: "Active", side: "Left" },
    right: { id: "AGT-0301", name: "Vacant Slot", rank: "Empty", side: "Right" }
  }
};

// Reusable Tree Node UI Card Component
const TreeNodeCard = ({ node }) => {
  const isEmpty = node.rank === "Empty";

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
        
        <h4 className="text-xs font-semibold text-slate-900 truncate">{node.name}</h4>
        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{node.id}</p>
        
        <div className="mt-2 flex items-center justify-center space-x-1">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
            isEmpty 
              ? 'bg-slate-200/60 text-slate-500' 
              : node.rank.includes('Pro') || node.rank.includes('Gold')
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'bg-slate-100 text-slate-700'
          }`}>
            {node.rank}
          </span>
          <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-1 rounded">
            {node.side}
          </span>
        </div>
      </div>
      
      {/* Visual connection handle if children exist */}
      {node.left && (
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
  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 font-sans text-slate-800 select-none overflow-x-auto">
      <div className="max-w-6xl mx-auto space-y-6 min-w-[800px]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Network Genealogy Matrix</h1>
            <p className="text-xs text-slate-500">Visual mapping of your binary direct channels and downline node hierarchy.</p>
          </div>
          
          <div className="flex items-center space-x-4 bg-white border border-slate-200 rounded-lg p-2 px-3 text-xs font-medium shadow-sm">
            <span className="flex items-center text-slate-600"><Users className="w-4 h-4 mr-1.5 text-slate-400" /> Active Team: <strong className="ml-1 text-slate-900">6 Agents</strong></span>
            <span className="w-px h-3 bg-slate-200"></span>
            <span className="flex items-center text-slate-600"><Network className="w-4 h-4 mr-1.5 text-slate-400" /> Structure: <strong className="ml-1 text-slate-900">Binary</strong></span>
          </div>
        </div>

        {/* VISUAL GENEALOGY CANVAS MAP */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col items-center">
          
          {/* LEVEL 1: ROOT NODE */}
          <div className="flex justify-center w-full relative">
            <TreeNodeCard node={TREE_DATA} />
          </div>
          
          {/* Connecting bar for Level 2 */}
          <div className="w-1/2 h-px bg-slate-200 my-0.5 mt-5"></div>

          {/* LEVEL 2: DIRECT CHANNELS (LEFT / RIGHT) */}
          <div className="flex justify-between w-full mt-1.5">
            {/* Left Node Branch */}
            <div className="flex flex-col items-center flex-1">
              <TreeNodeCard node={TREE_DATA.left} />
              
              {/* Connecting bar for Level 3 Left */}
              <div className="w-1/2 h-px bg-slate-200 my-0.5 mt-5"></div>
              
              {/* LEVEL 3: SUB-MEMBERS LEFT */}
              <div className="flex justify-between w-full mt-1.5">
                <TreeNodeCard node={TREE_DATA.left.left} />
                <TreeNodeCard node={TREE_DATA.left.right} />
              </div>
            </div>

            {/* Right Node Branch */}
            <div className="flex flex-col items-center flex-1">
              <TreeNodeCard node={TREE_DATA.right} />
              
              {/* Connecting bar for Level 3 Right */}
              <div className="w-1/2 h-px bg-slate-200 my-0.5 mt-5"></div>
              
              {/* LEVEL 3: SUB-MEMBERS RIGHT */}
              <div className="flex justify-between w-full mt-1.5">
                <TreeNodeCard node={TREE_DATA.right.left} />
                <TreeNodeCard node={TREE_DATA.right.right} />
              </div>
            </div>
          </div>

        </div>

        {/* AGENT LEADERBOARD NOTE */}
        <div className="bg-slate-950 text-white rounded-xl p-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide">Next Milestone Promotion Target</h3>
              <p className="text-[11px] text-slate-400 font-light mt-0.5">Activate 1 more direct agent on the Right Channel to unlock <span className="text-sky-400 font-medium font-mono">Ambassador Elite</span> status.</p>
            </div>
          </div>
          <span className="text-[10px] bg-white/15 px-2.5 py-1 rounded-md font-medium tracking-wider uppercase border border-white/5">Auto Balance ON</span>
        </div>

      </div>
    </div>
  );
};

export default AgentNetwork;