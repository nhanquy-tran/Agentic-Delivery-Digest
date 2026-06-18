/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StepGuideNode } from '../types';
import { AlignLeft, Layers, Compass, Code, GraduationCap, CheckCircle } from 'lucide-react';

export default function AdoptionGuide() {
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  const steps: StepGuideNode[] = [
    {
      id: 'step-1',
      title: 'Stage 1: Operational Capability Mapping & Inefficiencies Audit',
      duration: 'Weeks 1 - 3',
      shortDesc: 'Isolate repeatable developer overhead workflows, legacy upgrade friction, and redundant ticket backlogs.',
      icon: 'Compass',
      details: [
        'Audit historical velocity reports to locate repeating backlogs (e.g. node module updates, spring boot deprecated method upgrades).',
        'Identify repetitive manual logic patterns in test mock setups and sandbox environment provisions.',
        'Define clear technical boundaries: categorize files into "Agent Safe" (standard boilerplates) and "Human Architecture Only" (high strategic complexity).',
        'Document existing process maps step-by-step to feed as instructional prompt templates into subsequent AI agent roles.'
      ]
    },
    {
      id: 'step-2',
      title: 'Stage 2: Topology Structuring of Hybrid Human-AI Pods',
      duration: 'Weeks 4 - 6',
      shortDesc: 'Establish hybrid squad units that construct a collaborative developer-agent team paradigm.',
      icon: 'Layers',
      details: [
        'Assemble small prototype pods consisting of 2 Senior Staff Engineers paired with 3 specialized autonomous AI agent slots.',
        'Configure Agent Roles: Agent 1 (Architectural Reviewer & Prompt Context builder), Agent 2 (Code Generator & Package assembler), Agent 3 (Unit Tester & mock boundary verifier).',
        'Establish direct bidirectional workspace interfaces where agents submit modular suggestions directly into conversational developer streams.',
        'Calibrate team expectations: explain to employees that AI agents act as secondary hands under their precise orchestration, not competitors.'
      ]
    },
    {
      id: 'step-3',
      title: 'Stage 3: Establish Safe Action & Semantic Guardrails',
      duration: 'Weeks 7 - 9',
      shortDesc: 'Deploy safe pipelines and strict human-in-the-loop checkpoints to regulate automated agent commits.',
      icon: 'Code',
      details: [
        'Install rigorous security testing hooks. Block agent commits from writing directly to production slots without human sign-off.',
        'Integrate automated LLM evaluation tools that scan generated code syntax for secret keys leakages, buffer overflows, and architectural patterns matching.',
        'Set up automated Canary stages where agent-authored deployments run for 10 minutes inside isolated sandbox containers with real-time log monitors.',
        'Decline authorization for automated database structure refactoring (DDL) or financial calculations unless verified by 2 staff specialists.'
      ]
    },
    {
      id: 'step-4',
      title: 'Stage 4: Workforce Retooling, Career Paths & Compensation',
      duration: 'Ongoing Evolution',
      shortDesc: 'Upskill legacy developers from writers of repetitive code into system-level Orchestrator directors.',
      icon: 'GraduationCap',
      details: [
        'Launch interactive workshops training developers on Prompt Context Engineering, multi-agent frameworks, and vector log parsing.',
        'Re-tier human resources career hierarchies: establish new formal positions such as "AI Orchestration Designer" and "Prompt Guardrail Architect".',
        'Incentivize efficiency: reward team leaders based on the scale and correctness of automated pipelines, rather than total human hours/lines written.',
        'Provide psychological safety guarantees: guarantee that as redundant toil falls, human employees shift to high-level strategic scaling work.'
      ]
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-5 h-5 text-blue-600" />;
      case 'Layers': return <Layers className="w-5 h-5 text-blue-600" />;
      case 'Code': return <Code className="w-5 h-5 text-blue-600" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-blue-600" />;
      default: return <Compass className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      
      {/* Description */}
      <div className="space-y-1.5 border-b border-slate-150 pb-4">
        <h2 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-blue-600" /> Organization Workforce Adoption Guide
        </h2>
        <p className="text-xs text-slate-500 font-medium">A step-by-step roadmap to train teams and unlock the full economic capacity of agentic delivery</p>
      </div>

      {/* Roadmap visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step List navigation */}
        <div className="lg:col-span-5 space-y-3">
          {steps.map((st, idx) => {
            const isActive = idx === activeStageIdx;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStageIdx(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                  isActive
                    ? 'bg-blue-50/40 border-blue-500 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg bg-white border border-slate-200 shadow-sm ${isActive ? 'ring-1 ring-blue-200' : ''}`}>
                  {getIcon(st.icon)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-blue-750 bg-blue-50 border border-blue-105 px-1.5 py-0.5 rounded uppercase tracking-wide">
                      {st.duration}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                    {st.title.split(': ')[1] || st.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                    {st.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed active stage workspace */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Operational Implementation Plan</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100/80 px-2 py-0.5 rounded text-[10px]">{steps[activeStageIdx].duration}</span>
            </div>

            {/* Stage Title with Left-border block highlight */}
            <h3 className="font-sans font-extrabold text-sm text-slate-950 tracking-tight pl-3 border-l-4 border-blue-500 leading-tight">
              {steps[activeStageIdx].title}
            </h3>

            {/* Core Strategy */}
            <p className="text-xs text-slate-600 leading-relaxed font-sans italic bg-white p-3.5 border border-slate-200 rounded-lg shadow-sm font-normal">
              "{steps[activeStageIdx].shortDesc}"
            </p>

            {/* Items step-by-step checklist */}
            <div className="space-y-3.5 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tactical Checklist Actions:</span>
              <div className="space-y-2.5">
                {steps[activeStageIdx].details.map((desc, dIdx) => (
                  <div key={dIdx} className="flex gap-2.5 items-start">
                    <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center text-blue-700 text-[10px] font-bold font-mono shrink-0 mt-0.5 shadow-sm">
                      {dIdx + 1}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Goal Achieved Indicator */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unlocks Potential Scale</span>
            <div className="flex items-center gap-1 bg-emerald-50 text-[11px] text-emerald-800 font-bold px-2.5 py-1 border border-emerald-200 rounded">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              Stage Verified
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
