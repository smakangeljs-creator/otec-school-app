import React, { useState, useMemo } from 'react';
import { AppData, TimetableData, TimetableSlot } from '../types';
import { Calendar, Plus, Trash2, Clock } from 'lucide-react';
import { ALL_CLASSES } from '../lib/defaults';

interface TimetableViewerPanelProps {
  data: AppData;
  timetableState: TimetableData;
  onUpdateTimetable: (data: TimetableData) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export default function TimetableViewerPanel({ data, timetableState, onUpdateTimetable }: TimetableViewerPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('P1');
  const [newSlot, setNewSlot] = useState<Partial<TimetableSlot>>({
    classId: 'P1',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '09:00'
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.subjectId || !newSlot.teacherId) return;

    const slot: TimetableSlot = {
      id: 'slot-' + Date.now(),
      classId: newSlot.classId || 'P1',
      dayOfWeek: newSlot.dayOfWeek as any || 'Monday',
      startTime: newSlot.startTime || '08:00',
      endTime: newSlot.endTime || '09:00',
      subjectId: newSlot.subjectId,
      teacherId: newSlot.teacherId,
      roomId: newSlot.roomId
    };

    onUpdateTimetable({
      ...timetableState,
      slots: [...timetableState.slots, slot]
    });

    setNewSlot({ ...newSlot, subjectId: '', teacherId: '', roomId: '' });
    setShowAddForm(false);
  };

  const handleDeleteSlot = (id: string) => {
    if (confirm('Delete this timetable slot?')) {
      onUpdateTimetable({
        ...timetableState,
        slots: timetableState.slots.filter(s => s.id !== id)
      });
    }
  };

  // Helper arrays for dropdowns
  const availableClasses = ALL_CLASSES;
  const subjects = Object.values(data.settings?.sections || {}).flatMap(s => s.subjects);
  const teachers = data.settings?.teachersList || [];

  // Filter slots for the currently selected class, sorted by start time
  const classSlots = useMemo(() => {
    const slots = timetableState.slots.filter(s => s.classId === selectedClass);
    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetableState.slots, selectedClass]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-slate-700">Viewing Timetable For:</label>
          <select
            className="border-slate-200 rounded-lg p-2 text-sm focus:ring-emerald-500 font-semibold text-emerald-700 bg-emerald-50"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {availableClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setNewSlot({ ...newSlot, classId: selectedClass });
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add Time Slot'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSlot} className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-md space-y-4 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Add New Lesson for {selectedClass}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Day *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-emerald-500"
                value={newSlot.dayOfWeek || 'Monday'}
                onChange={e => setNewSlot({ ...newSlot, dayOfWeek: e.target.value as any })}
              >
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Start Time *</label>
              <input
                required
                type="time"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-emerald-500"
                value={newSlot.startTime || ''}
                onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">End Time *</label>
              <input
                required
                type="time"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-emerald-500"
                value={newSlot.endTime || ''}
                onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
              />
            </div>
            <div className="xl:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Subject *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-emerald-500"
                value={newSlot.subjectId || ''}
                onChange={e => setNewSlot({ ...newSlot, subjectId: e.target.value })}
              >
                <option value="">-- Choose Subject --</option>
                {Array.from(new Set(subjects)).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Teacher *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-emerald-500"
                value={newSlot.teacherId || ''}
                onChange={e => setNewSlot({ ...newSlot, teacherId: e.target.value })}
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Slot
            </button>
          </div>
        </form>
      )}

      {/* Timetable Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {DAYS_OF_WEEK.slice(0, 5).map(day => {
          const slotsForDay = classSlots.filter(s => s.dayOfWeek === day);
          
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 p-3 text-center">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">{day}</h4>
              </div>
              <div className="p-3 flex-1 flex flex-col gap-3">
                {slotsForDay.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic py-8">
                    Free / No classes
                  </div>
                ) : (
                  slotsForDay.map(slot => {
                    const teacher = teachers.find(t => t.id === slot.teacherId);
                    return (
                      <div key={slot.id} className="relative group bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 hover:bg-emerald-50 transition-colors">
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-100 rounded transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[10px] font-bold mb-1">
                          <Clock size={12} />
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="font-bold text-slate-800 text-sm truncate">{slot.subjectId}</div>
                        <div className="text-xs text-slate-500 mt-1 truncate">
                          {teacher ? teacher.name : 'Unknown Teacher'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
