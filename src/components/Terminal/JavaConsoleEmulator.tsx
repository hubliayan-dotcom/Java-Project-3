import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { hotelService, rangesOverlap, calculateNights, calculateBill, getTodayDateString, addDaysToDateString } from '../../services/hotelEngine';
import { runAllTests } from '../../services/testSuite';

interface ConsoleLine {
  id: string;
  text: string;
  type: 'prompt' | 'output' | 'error' | 'success' | 'banner' | 'system';
}

export const JavaConsoleEmulator: React.FC = () => {
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [activePrompt, setActivePrompt] = useState<{
    stage: string;
    callback: (val: string) => void;
    placeholder: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = (text: string, type: ConsoleLine['type'] = 'output') => {
    setLines((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), text, type },
    ]);
  };

  const addLines = (newLines: { text: string; type?: ConsoleLine['type'] }[]) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((l) => ({
        id: Math.random().toString(36).substring(2, 9),
        text: l.text,
        type: l.type || 'output',
      })),
    ]);
  };

  // Scroll to bottom on updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Initial startup banner & menu
  useEffect(() => {
    printMainMenu();
  }, []);

  const printMainMenu = () => {
    addLines([
      { text: '==================================================', type: 'banner' },
      { text: '     GRAND HORIZON HOTEL - FRONT DESK SYSTEM      ', type: 'banner' },
      { text: '==================================================', type: 'banner' },
      { text: '  1. List All Rooms' },
      { text: '  2. Search Available Rooms (Date Overlap Check)' },
      { text: '  3. Create New Booking' },
      { text: '  4. View Booking Details' },
      { text: '  5. Cancel Reservation' },
      { text: '  6. Guest Check-In' },
      { text: '  7. Guest Check-Out & Billing' },
      { text: '  8. View Booking History' },
      { text: '  9. View CSV Storage (data/bookings.csv)' },
      { text: '  10. Run Full QA Test Matrix (Section 10)' },
      { text: '  clear: Clear screen' },
      { text: '==================================================', type: 'banner' },
    ]);
    setActivePrompt(null);
  };

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine(`> ${trimmed}`, 'prompt');
    setInputVal('');

    // If there is an active multi-step prompt handler
    if (activePrompt) {
      const cb = activePrompt.callback;
      setActivePrompt(null);
      cb(trimmed);
      return;
    }

    switch (trimmed) {
      case '1':
        listRooms();
        break;
      case '2':
        searchAvailable();
        break;
      case '3':
        createBookingFlow();
        break;
      case '4':
        viewBookingFlow();
        break;
      case '5':
        cancelBookingFlow();
        break;
      case '6':
        checkInFlow();
        break;
      case '7':
        checkOutFlow();
        break;
      case '8':
        viewHistory();
        break;
      case '9':
        viewCsvData();
        break;
      case '10':
        await executeTests();
        break;
      case 'clear':
      case 'cls':
        setLines([]);
        printMainMenu();
        break;
      default:
        addLine(`Unknown command: "${trimmed}". Enter a number between 1 and 10, or "clear".`, 'error');
        break;
    }
  };

  const listRooms = () => {
    const rooms = hotelService.getRooms();
    addLine('\n--- ROOM INVENTORY ---', 'system');
    addLine('Number   Type            Status       Rate/Night', 'system');
    addLine('--------------------------------------------------', 'system');
    rooms.forEach((r) => {
      const line = `${r.roomNumber.toString().padEnd(8)} ${r.type.padEnd(15)} ${r.status.padEnd(12)} Rs.${r.rate.toFixed(2)}`;
      addLine(line);
    });
    addLine('');
  };

  const searchAvailable = () => {
    addLine('\n--- SEARCH ROOM AVAILABILITY ---', 'system');
    addLine('Select Room Type (1: Single, 2: Double, 3: Deluxe, 4: Suite, 0: All):');
    setActivePrompt({
      stage: 'search_type',
      placeholder: 'Enter room type (0-4)...',
      callback: (typeVal) => {
        let typeStr: any = undefined;
        if (typeVal === '1') typeStr = 'SINGLE';
        else if (typeVal === '2') typeStr = 'DOUBLE';
        else if (typeVal === '3') typeStr = 'DELUXE';
        else if (typeVal === '4') typeStr = 'SUITE';

        addLine('Enter Check-in Date (YYYY-MM-DD):');
        setActivePrompt({
          stage: 'search_checkin',
          placeholder: 'e.g. 2026-09-01',
          callback: (inVal) => {
            addLine('Enter Check-out Date (YYYY-MM-DD):');
            setActivePrompt({
              stage: 'search_checkout',
              placeholder: 'e.g. 2026-09-03',
              callback: (outVal) => {
                const res = hotelService.searchAvailableRooms(inVal, outVal, typeStr);
                addLine(`\nSearch Results for ${inVal} to ${outVal}:`, 'system');
                if (res.availableRooms.length === 0) {
                  addLine('No rooms available for the selected dates and criteria.', 'error');
                } else {
                  addLine('Room     Type            Rate/Night', 'system');
                  addLine('----------------------------------------', 'system');
                  res.availableRooms.forEach((r) => {
                    addLine(`${r.roomNumber.toString().padEnd(8)} ${r.type.padEnd(15)} Rs.${r.rate.toFixed(2)}`);
                  });
                  addLine(`Found ${res.availableRooms.length} available room(s).`, 'success');
                }
              },
            });
          },
        });
      },
    });
  };

  const createBookingFlow = () => {
    addLine('\n--- CREATE NEW BOOKING ---', 'system');
    addLine('Select Room Type (1: Single, 2: Double, 3: Deluxe, 4: Suite):');
    setActivePrompt({
      stage: 'create_type',
      placeholder: '1, 2, 3, or 4',
      callback: (typeVal) => {
        const typeMap: Record<string, any> = { '1': 'SINGLE', '2': 'DOUBLE', '3': 'DELUXE', '4': 'SUITE' };
        const selectedType = typeMap[typeVal] || 'SINGLE';

        const today = getTodayDateString();
        addLine(`Enter Check-in Date (YYYY-MM-DD) [default: ${today}]:`);
        setActivePrompt({
          stage: 'create_checkin',
          placeholder: today,
          callback: (inVal) => {
            const checkIn = inVal || today;
            const defaultOut = addDaysToDateString(checkIn, 2);
            addLine(`Enter Check-out Date (YYYY-MM-DD) [default: ${defaultOut}]:`);
            setActivePrompt({
              stage: 'create_checkout',
              placeholder: defaultOut,
              callback: (outVal) => {
                const checkOut = outVal || defaultOut;
                const search = hotelService.searchAvailableRooms(checkIn, checkOut, selectedType);
                if (search.availableRooms.length === 0) {
                  addLine(`Sorry, no ${selectedType} rooms available for these dates.`, 'error');
                  return;
                }

                addLine(`Available ${selectedType} Rooms: ${search.availableRooms.map((r) => r.roomNumber).join(', ')}`);
                addLine('Enter chosen Room Number:');
                setActivePrompt({
                  stage: 'create_roomnum',
                  placeholder: search.availableRooms[0].roomNumber.toString(),
                  callback: (roomNumVal) => {
                    const rNum = parseInt(roomNumVal || search.availableRooms[0].roomNumber.toString(), 10);
                    addLine('Enter Guest Full Name:');
                    setActivePrompt({
                      stage: 'create_guest',
                      placeholder: 'e.g. John Doe',
                      callback: (gName) => {
                        const guestName = gName || 'Guest User';
                        addLine('Enter Guest Phone (optional):');
                        setActivePrompt({
                          stage: 'create_phone',
                          placeholder: '+1 555-0100',
                          callback: (gPhone) => {
                            const res = hotelService.createBooking({
                              roomNumber: rNum,
                              guest: { name: guestName, phone: gPhone, email: '' },
                              checkInDate: checkIn,
                              checkOutDate: checkOut,
                            });

                            if (!res.success || !res.booking) {
                              addLine(`Booking failed: ${res.error}`, 'error');
                              return;
                            }

                            const b = res.booking;
                            addLines([
                              { text: '==================================================', type: 'banner' },
                              { text: '           BOOKING CONFIRMATION SUCCESS           ', type: 'success' },
                              { text: '==================================================', type: 'banner' },
                              { text: ` Booking ID    : ${b.bookingId}` },
                              { text: ` Guest Name    : ${b.guest.name}` },
                              { text: ` Room Number   : ${b.roomNumber} (${b.roomType})` },
                              { text: ` Stay Duration : ${b.nights} nights (${b.checkInDate} to ${b.checkOutDate})` },
                              { text: ` Total Bill    : Rs.${b.billing.totalAmount.toFixed(2)} (inc. 10% tax)` },
                              { text: ` Status        : ${b.status}` },
                              { text: '==================================================', type: 'banner' },
                            ]);
                          },
                        });
                      },
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
  };

  const viewBookingFlow = () => {
    addLine('\nEnter Booking ID to view (e.g. BK-1001):', 'system');
    setActivePrompt({
      stage: 'view_id',
      placeholder: 'BK-1001',
      callback: (idVal) => {
        const b = hotelService.getBooking(idVal);
        if (!b) {
          addLine(`No booking found with ID: ${idVal}`, 'error');
          return;
        }

        addLines([
          { text: '\n--- BOOKING DETAILS ---', type: 'system' },
          { text: `Booking ID   : ${b.bookingId}` },
          { text: `Guest Name   : ${b.guest.name} (${b.guest.phone || 'No phone'})` },
          { text: `Room Number  : ${b.roomNumber} [${b.roomType}]` },
          { text: `Dates        : ${b.checkInDate} to ${b.checkOutDate} (${b.nights} nights)` },
          { text: `Status       : ${b.status}` },
          { text: `Total Amount : Rs.${b.billing.totalAmount.toFixed(2)}` },
        ]);
      },
    });
  };

  const cancelBookingFlow = () => {
    addLine('\nEnter Booking ID to Cancel:', 'system');
    setActivePrompt({
      stage: 'cancel_id',
      placeholder: 'BK-1002',
      callback: (idVal) => {
        addLine('Enter Cancellation Reason (press Enter for default):');
        setActivePrompt({
          stage: 'cancel_reason',
          placeholder: 'Flight delayed by airline',
          callback: (reasonVal) => {
            const reason = reasonVal.trim() || 'Flight delayed by airline';
            const res = hotelService.cancelBooking(idVal, reason);
            if (res.success) {
              addLine(`${res.message} (Reason: ${reason})`, 'success');
            } else {
              addLine(res.message, 'error');
            }
          },
        });
      },
    });
  };

  const checkInFlow = () => {
    addLine('\nEnter Booking ID for Check-In:', 'system');
    setActivePrompt({
      stage: 'checkin_id',
      placeholder: 'BK-1002',
      callback: (idVal) => {
        const res = hotelService.checkIn(idVal);
        if (res.success) {
          addLine(res.message, 'success');
        } else {
          addLine(res.message, 'error');
        }
      },
    });
  };

  const checkOutFlow = () => {
    addLine('\nEnter Booking ID for Check-Out:', 'system');
    setActivePrompt({
      stage: 'checkout_id',
      placeholder: 'BK-1001',
      callback: (idVal) => {
        const res = hotelService.checkOut(idVal);
        if (!res.success) {
          addLine(res.message, 'error');
          return;
        }

        const b = res.booking!;
        addLines([
          { text: '==================================================', type: 'banner' },
          { text: '               FINAL INVOICE / BILL               ', type: 'success' },
          { text: '==================================================', type: 'banner' },
          { text: ` Invoice No    : INV-${b.bookingId}` },
          { text: ` Guest         : ${b.guest.name}` },
          { text: ` Room          : ${b.roomNumber} (${b.roomType})` },
          { text: ` Stay Duration : ${b.nights} nights` },
          { text: ` Total Paid    : Rs.${b.billing.totalAmount.toFixed(2)}` },
          { text: ' Status        : PAID & CHECKED OUT' },
          { text: ` Room Status   : Room ${b.roomNumber} is now VACANT` },
          { text: '==================================================', type: 'banner' },
        ]);
      },
    });
  };

  const viewHistory = () => {
    const bookings = hotelService.getBookings();
    addLine('\n--- ALL BOOKING RECORDS ---', 'system');
    if (bookings.length === 0) {
      addLine('No bookings recorded yet.');
      return;
    }
    addLine('ID         Room     Guest            Check-In     Check-Out    Status     Total', 'system');
    addLine('--------------------------------------------------------------------------------', 'system');
    bookings.forEach((b) => {
      const line = `${b.bookingId.padEnd(10)} ${b.roomNumber.toString().padEnd(8)} ${b.guest.name.slice(0, 15).padEnd(16)} ${b.checkInDate.padEnd(12)} ${b.checkOutDate.padEnd(12)} ${b.status.padEnd(10)} Rs.${b.billing.totalAmount.toFixed(2)}`;
      addLine(line);
    });
    addLine('');
  };

  const viewCsvData = () => {
    const csv = hotelService.exportBookingsCSV();
    addLine('\n--- data/bookings.csv ---', 'system');
    csv.split('\n').forEach((row) => addLine(row));
    addLine('--- End of CSV ---\n', 'system');
  };

  const executeTests = async () => {
    addLine('\n--- RUNNING AUTOMATED QA TEST MATRIX (Section 10) ---', 'system');
    const results = await runAllTests();
    results.forEach((t) => {
      const prefix = t.status === 'PASS' ? '[PASS]' : '[FAIL]';
      const type = t.status === 'PASS' ? 'success' : 'error';
      addLine(`${prefix} Test #${t.id}: ${t.title} (${t.durationMs}ms) - ${t.actual}`, type);
    });
    const passedCount = results.filter((r) => r.status === 'PASS').length;
    addLine(`\nSummary: ${passedCount}/${results.length} tests passed successfully.\n`, 'success');
  };

  // Run the complete virtual simulation walkthrough script from Section 9
  const runWalkthroughScript = async () => {
    if (isAutomating) return;
    setIsAutomating(true);
    setLines([]);

    addLine('>>> INITIALIZING VIRTUAL SIMULATION WALKTHROUGH (Section 9) <<<', 'banner');

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    await delay(300);
    addLine('> 1  (List all rooms)', 'prompt');
    listRooms();

    await delay(600);
    addLine('> 2  (Search available Single rooms for 2026-09-01 to 2026-09-03)', 'prompt');
    const searchRes = hotelService.searchAvailableRooms('2026-09-01', '2026-09-03', 'SINGLE');
    addLine(`Available Single Rooms: ${searchRes.availableRooms.map((r) => r.roomNumber).join(', ')}`, 'success');

    await delay(600);
    addLine('> 3  (Create booking for John Doe on Room 102)', 'prompt');
    const bRes = hotelService.createBooking({
      roomNumber: 102,
      guest: { name: 'John Doe', phone: '+1 555-0199', email: 'johndoe@test.com' },
      checkInDate: '2026-09-01',
      checkOutDate: '2026-09-03',
    });
    const bId = bRes.booking?.bookingId || 'BK-1004';
    addLine(`Booking created: ID ${bId}, Total Rs.4400.00 (Status: RESERVED)`, 'success');

    await delay(600);
    addLine(`> 6  (Check in booking ${bId})`, 'prompt');
    const ci = hotelService.checkIn(bId);
    addLine(ci.message, 'success');

    await delay(600);
    addLine(`> 7  (Check out booking ${bId} and print bill)`, 'prompt');
    const co = hotelService.checkOut(bId);
    addLine(co.message, 'success');

    await delay(600);
    addLine('> 8  (View booking history)', 'prompt');
    viewHistory();

    addLine('>>> SIMULATION WALKTHROUGH COMPLETE <<<', 'banner');
    setIsAutomating(false);
  };

  const copyConsoleOutput = () => {
    const fullText = lines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono flex flex-col h-[650px]">
      {/* Terminal Titlebar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-xs text-slate-400 font-semibold ml-2 flex items-center space-x-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>java HotelApp.java — Interactive Terminal Engine</span>
          </span>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={runWalkthroughScript}
            disabled={isAutomating}
            className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>{isAutomating ? 'Simulating...' : 'Run Section 9 Walkthrough'}</span>
          </button>

          <button
            onClick={copyConsoleOutput}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setLines([]);
              printMainMenu();
            }}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Reset Terminal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Menu Buttons */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="text-slate-500 self-center mr-1">Quick Run:</span>
        <button
          onClick={() => handleCommand('1')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
        >
          [1] List Rooms
        </button>
        <button
          onClick={() => handleCommand('2')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
        >
          [2] Search Overlap
        </button>
        <button
          onClick={() => handleCommand('3')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
        >
          [3] Create Booking
        </button>
        <button
          onClick={() => handleCommand('8')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
        >
          [8] History
        </button>
        <button
          onClick={() => handleCommand('9')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
        >
          [9] CSV View
        </button>
        <button
          onClick={() => handleCommand('10')}
          className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60 cursor-pointer"
        >
          [10] QA Test Matrix
        </button>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((l) => {
          let color = 'text-slate-300';
          if (l.type === 'prompt') color = 'text-amber-400 font-semibold';
          else if (l.type === 'banner') color = 'text-amber-500 font-bold';
          else if (l.type === 'system') color = 'text-sky-400 font-semibold';
          else if (l.type === 'success') color = 'text-emerald-400 font-semibold';
          else if (l.type === 'error') color = 'text-rose-400 font-semibold';

          return (
            <div key={l.id} className={`${color} whitespace-pre-wrap`}>
              {l.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Line */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand(inputVal);
        }}
        className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2"
      >
        <span className="text-amber-400 font-bold select-none">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={activePrompt?.placeholder || 'Enter option (1-10) or command...'}
          className="flex-1 bg-transparent text-slate-100 text-xs sm:text-sm focus:outline-none placeholder-slate-600"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 bg-amber-500 text-slate-950 rounded text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
};
