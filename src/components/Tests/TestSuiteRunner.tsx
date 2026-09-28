import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Clock,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { runAllTests } from '../../services/testSuite';
import { TestResult } from '../../types/hotel';

export const TestSuiteRunner: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    const res = await runAllTests();
    setResults(res);
    setIsRunning(false);

    const allPassed = res.every((t) => t.status === 'PASS');
    if (allPassed) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const totalTests = results.length;
  const passedCount = results.filter((r) => r.status === 'PASS').length;
  const failedCount = results.filter((r) => r.status === 'FAIL').length;
  const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Test Runner Hero Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Section 10 — Automated QA Test Matrix</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  10 Test Cases
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end verification of overlap math, money calculations, and state machine invariants.
              </p>
            </div>
          </div>

          <button
            id="btn-run-all-tests"
            onClick={runTests}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Re-run All 10 Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Stats summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Total Test Cases</span>
            <span className="text-xl font-bold text-white mt-1 block">{totalTests}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40">
            <span className="text-emerald-400 font-medium block text-[11px]">Passed Verification</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">{passedCount} / {totalTests}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-rose-400 font-medium block text-[11px]">Failed Regressions</span>
            <span className="text-xl font-bold text-rose-400 mt-1 block">{failedCount}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Execution Time</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{totalDuration} ms</span>
          </div>
        </div>
      </div>

      {/* Test Matrix List */}
      <div className="space-y-3">
        {results.map((test) => {
          const isExpanded = expandedTestId === test.id;
          const isPass = test.status === 'PASS';

          return (
            <div
              key={test.id}
              id={`test-case-card-${test.id}`}
              className={`bg-slate-900 border rounded-xl overflow-hidden transition ${
                isPass ? 'border-slate-800 hover:border-slate-700' : 'border-rose-500/50'
              }`}
            >
              {/* Header row */}
              <button
                onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isPass ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    #{test.id}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">{test.title}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isPass
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {test.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{test.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-slate-500">{test.durationMs}ms</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {/* Collapsible details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/60 space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                        Expected Outcome
                      </span>
                      <p className="text-slate-300">{test.expected}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                        Actual Observed Outcome
                      </span>
                      <p className={isPass ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                        {test.actual}
                      </p>
                    </div>
                  </div>

                  {/* Execution step logs */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-[11px] space-y-1">
                    <div className="text-[10px] text-amber-400 font-semibold uppercase mb-1">
                      Execution Step-by-Step Traces:
                    </div>
                    {test.executionLogs.map((log, i) => (
                      <div key={i} className="text-slate-400">
                        <span className="text-slate-600 select-none mr-2">[{i + 1}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
