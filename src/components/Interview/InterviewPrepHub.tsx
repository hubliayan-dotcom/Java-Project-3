import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  HelpCircle,
  Download,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Cpu,
  Layers,
  FolderTree,
  FileCode2,
  Archive,
  Terminal,
} from 'lucide-react';
import JSZip from 'jszip';
import { INTERVIEW_QUESTIONS, JAVA_PROJECT_FILES, JavaFileEntry } from '../../data/javaSourceCode';
import { hotelService } from '../../services/hotelEngine';

export const InterviewPrepHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interview' | 'code' | 'architecture' | 'csv'>('interview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQId, setExpandedQId] = useState<number | null>(1);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const currentFile: JavaFileEntry = JAVA_PROJECT_FILES[selectedFileIndex] || JAVA_PROJECT_FILES[0];

  const filteredQuestions = INTERVIEW_QUESTIONS.filter((q) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.question.toLowerCase().includes(s) ||
      q.answer.toLowerCase().includes(s) ||
      q.tags.some((t) => t.toLowerCase().includes(s))
    );
  });

  const handleCopyCurrentFile = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCurrentFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCompleteZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Root build & run files
      zip.file('pom.xml', JAVA_PROJECT_FILES.find((f) => f.filename === 'pom.xml')?.content || '');
      zip.file(
        'run.sh',
        `#!/usr/bin/env bash
set -e
echo "Compiling and launching Hotel Room Booking System..."
mkdir -p bin data
javac -d bin -sourcepath src/main/java $(find src/main/java -name "*.java")
java -cp bin com.hotel.main.Main
`
      );
      zip.file(
        'run.bat',
        `@echo off
if not exist bin mkdir bin
if not exist data mkdir data
dir /s /b src\\main\\java\\*.java > sources.txt
javac -d bin -sourcepath src\\main\\java @sources.txt
del sources.txt
java -cp bin com.hotel.main.Main
pause
`
      );
      zip.file(
        'README.md',
        `# Grand Horizon Hotel Room Booking System
Core Java OOP + java.nio File Handling + BigDecimal Console Application.

## Compilation & Run
- Using Maven: \`mvn clean compile exec:java\`
- Run Tests: \`mvn test\`
- Direct Script: \`./run.sh\` (Linux/macOS) or \`run.bat\` (Windows)
`
      );

      // Data sample
      zip.file(
        'data/bookings.csv',
        `bookingId,roomNumber,roomType,guestName,phone,email,idProof,numberOfGuests,checkInDate,checkOutDate,numberOfNights,roomCharge,taxAmount,totalAmount,status
BK-1001,201,DOUBLE,John Doe,+1 555-0199,john.doe@example.com,PASSPORT-A9921,2,2026-08-17,2026-08-19,2,6000.00,600.00,6600.00,IN_HOUSE
BK-1002,301,DELUXE,Sarah Jenkins,+1 555-0144,sarah.j@example.com,DL-88291,2,2026-08-20,2026-08-23,3,13500.00,1350.00,14850.00,RESERVED
`
      );

      // Add all source and test files preserving directory structure
      for (const file of JAVA_PROJECT_FILES) {
        if (file.filename !== 'pom.xml' && file.filename !== 'README.md') {
          zip.file(file.path, file.content);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hotel-room-booking-java-app.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const csvContent = hotelService.exportBookingsCSV();

  const handleCopyCsv = () => {
    navigator.clipboard.writeText(csvContent);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'interview'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Interview Q&amp;A (Q1-Q10)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'code'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Java Source Code Explorer ({JAVA_PROJECT_FILES.length} Files)</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>OOP Architecture &amp; UML</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'csv'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>data/bookings.csv Preview</span>
          </button>
        </div>

        {activeTab === 'code' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCurrentFile}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Current File'}</span>
            </button>
            <button
              onClick={handleDownloadCurrentFile}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{currentFile.filename.split('.').pop()}</span>
            </button>
            <button
              onClick={handleDownloadCompleteZip}
              disabled={isZipping}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Packaging ZIP...' : 'Download Full Project (.ZIP)'}</span>
            </button>
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCsv ? 'Copied!' : 'Copy CSV'}</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download bookings.csv</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Interview Q&A Flashcards */}
      {activeTab === 'interview' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search interview questions (e.g. overlap, BigDecimal, enums, persistence, capacity)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              Showing {filteredQuestions.length} of {INTERVIEW_QUESTIONS.length} Questions
            </span>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((item) => {
              const isExpanded = expandedQId === item.id;
              return (
                <div
                  key={item.id}
                  id={`interview-q-${item.id}`}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedQId(isExpanded ? null : item.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        Q{item.id}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.question}</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="hidden sm:flex items-center space-x-1">
                        {item.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 bg-slate-950/50 space-y-3 text-xs">
                      <div className="text-slate-300 leading-relaxed font-sans text-sm">
                        <strong className="text-amber-400 block mb-1 text-xs uppercase tracking-wider">Answer:</strong>
                        <p>{item.answer}</p>
                      </div>

                      {item.codeSnippet && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-amber-300/90 overflow-x-auto">
                          <pre>{item.codeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Modular Java Source Code Explorer */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* File Tree Sidebar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <FolderTree className="w-4 h-4 text-amber-400" />
                <span>Project Files</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Java 17+</span>
            </div>

            <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
              {JAVA_PROJECT_FILES.map((file, idx) => {
                const isSelected = selectedFileIndex === idx;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase px-1 py-0.5 rounded bg-slate-950">
                      {file.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Run Hint */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <strong className="text-amber-400 block">Command Line Execution:</strong>
              <p className="font-mono text-[10px] text-slate-300">mvn clean compile exec:java</p>
              <p className="text-[10px] text-slate-500">or run test suite via <code className="text-amber-300">mvn test</code></p>
            </div>
          </div>

          {/* File Content Viewer */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-slate-200 font-semibold">{currentFile.path}</span>
              </div>
              <span className="text-slate-400 text-[11px]">{currentFile.content.split('\n').length} lines</span>
            </div>

            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/60 text-[11px] text-slate-400 flex items-center space-x-2">
              <span className="text-amber-400 font-semibold">Purpose:</span>
              <span>{currentFile.description}</span>
            </div>

            <div className="p-4 overflow-x-auto text-slate-300 max-h-[580px] font-mono text-xs leading-relaxed">
              <pre>{currentFile.content}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: OOP Architecture & UML Model */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span>Domain Modeling &amp; OOP Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Encapsulation, enums, financial precision with BigDecimal, and layered separation of concerns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Room Model */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 text-sm">Class: Room</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Entity</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li>- roomNumber: int</li>
                <li>- roomType: RoomType</li>
                <li>- pricePerNight: BigDecimal</li>
                <li>- maximumCapacity: int</li>
                <li>- status: RoomStatus</li>
              </ul>
              <div className="pt-2 border-t border-slate-800 text-slate-300 text-[11px]">
                Encapsulates physical room inventory and occupancy state.
              </div>
            </div>

            {/* Guest Model */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 text-sm">Class: Guest</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Value Object</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li>- guestName: String</li>
                <li>- phone: String</li>
                <li>- email: String</li>
                <li>- idProof: String</li>
                <li>- numberOfGuests: int</li>
              </ul>
              <div className="pt-2 border-t border-slate-800 text-slate-300 text-[11px]">
                Encapsulates guest contact records and party size validation.
              </div>
            </div>

            {/* Booking Model */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sky-400 text-sm">Class: Booking</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Aggregate</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li>- bookingId: String</li>
                <li>- guest: Guest</li>
                <li>- room: Room</li>
                <li>- checkIn / checkOut: LocalDate</li>
                <li>- roomCharge / tax: BigDecimal</li>
                <li>- status: BookingStatus</li>
              </ul>
              <div className="pt-2 border-t border-slate-800 text-slate-300 text-[11px]">
                Maintains date interval math and exact 10% tax breakdown.
              </div>
            </div>

            {/* Repository & Service */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-purple-400 text-sm">Engine Layers</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Service/Repo</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li><strong className="text-slate-200">HotelService:</strong> Overlap checks, reservations, check-in/out logic.</li>
                <li><strong className="text-slate-200">FileManager:</strong> Atomic CSV serialization via java.nio.file.</li>
                <li><strong className="text-slate-200">InputValidator:</strong> Date, phone, and capacity sanitization.</li>
              </ul>
            </div>
          </div>

          {/* State Machine Flow */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase text-amber-400 mb-3">Booking State Machine Lifecycle</h4>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center flex-1 w-full">
                <strong>1. RESERVED</strong>
                <p className="text-[10px] text-slate-400 mt-1">Booked in advance; Room is vacant until arrival</p>
              </div>
              <span className="text-slate-500 font-bold hidden md:inline">→ Check-In →</span>
              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-center flex-1 w-full">
                <strong>2. IN_HOUSE</strong>
                <p className="text-[10px] text-slate-400 mt-1">Guest has checked in; Room status is OCCUPIED</p>
              </div>
              <span className="text-slate-500 font-bold hidden md:inline">→ Check-Out →</span>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center flex-1 w-full">
                <strong>3. COMPLETED</strong>
                <p className="text-[10px] text-slate-400 mt-1">Bill finalized &amp; paid; Room returned to VACANT</p>
              </div>
            </div>
            <div className="mt-3 text-center text-rose-400 text-xs">
              <span>* A reservation in <strong>RESERVED</strong> state can transition to <strong>CANCELLED</strong>. In-house or completed stays cannot be cancelled.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: CSV Data Storage Preview */}
      {activeTab === 'csv' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400 text-xs">
            <span>data/bookings.csv (Persistent File Representation)</span>
            <span>{csvContent.split('\n').length} Records</span>
          </div>
          <div className="p-4 overflow-x-auto text-emerald-400 max-h-[500px] leading-relaxed">
            <pre>{csvContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
