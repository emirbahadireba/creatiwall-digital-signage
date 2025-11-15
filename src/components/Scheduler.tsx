import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Scheduler() {
  const { schedules = [], playlists, updateSchedule, deleteSchedule } = useStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const getSchedulesForDay = (date: Date) => {
    if (!schedules || !Array.isArray(schedules)) {
      return [];
    }
    
    return schedules.filter(schedule => {
      const dayName = format(date, 'EEEE', { locale: tr });
      return schedule.days && schedule.days.includes(dayName) && schedule.active;
    });
  };

  const toggleScheduleStatus = (scheduleId: string, currentStatus: boolean) => {
    updateSchedule(scheduleId, { active: !currentStatus });
  };

  const handleDeleteSchedule = (scheduleId: string, scheduleName: string) => {
    if (window.confirm(`"${scheduleName}" programını silmek istediğinizden emin misiniz?`)) {
      deleteSchedule(scheduleId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">Zamanlayıcı</h1>
          <p className="text-textSecondary mt-1">Playlist'leri zamanla ve programla</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 transition-colors ${
                viewMode === 'calendar' ? 'bg-primary text-white' : 'bg-surface text-textSecondary hover:text-text'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface text-textSecondary hover:text-text'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Program</span>
          </motion.button>
        </div>
      </motion.div>

      {viewMode === 'calendar' ? (
        <div className="space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-textSecondary" />
            </button>
            <h2 className="text-xl font-semibold text-text">
              {format(weekStart, 'd MMMM', { locale: tr })} - {format(weekEnd, 'd MMMM yyyy', { locale: tr })}
            </h2>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-textSecondary" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-4 bg-background text-center text-sm font-medium text-textSecondary">
                Saat
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={day.toISOString()}
                  className={`p-4 text-center border-l border-border ${
                    isSameDay(day, new Date()) ? 'bg-primary/10' : 'bg-background'
                  }`}
                >
                  <div className="text-sm font-medium text-text">{dayNames[index]}</div>
                  <div className="text-xs text-textSecondary mt-1">
                    {format(day, 'd MMM', { locale: tr })}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="max-h-96 overflow-y-auto">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-border">
                  <div className="p-2 bg-background text-center text-xs text-textSecondary border-r border-border">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const daySchedules = getSchedulesForDay(day);
                    const currentHour = parseInt(time.split(':')[0]);
                    const hasSchedule = daySchedules.some(schedule => {
                      const startHour = parseInt(schedule.startTime.split(':')[0]);
                      const endHour = parseInt(schedule.endTime.split(':')[0]);
                      return currentHour >= startHour && currentHour < endHour;
                    });

                    return (
                      <div
                        key={`${day.toISOString()}-${time}`}
                        className={`p-2 border-l border-border min-h-[40px] ${
                          hasSchedule ? 'bg-primary/20' : 'hover:bg-background/50'
                        } transition-colors cursor-pointer`}
                      >
                        {hasSchedule && (
                          <div className="text-xs bg-primary text-white px-2 py-1 rounded truncate">
                            {daySchedules.find(s => {
                              const startHour = parseInt(s.startTime.split(':')[0]);
                              const endHour = parseInt(s.endTime.split(':')[0]);
                              return currentHour >= startHour && currentHour < endHour;
                            })?.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Schedule List */}
          {schedules.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-xl border border-border">
              <Calendar className="w-12 h-12 text-textSecondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">Henüz program yok</h3>
              <p className="text-textSecondary">İlk programınızı oluşturmak için "Yeni Program" butonunu kullanın.</p>
            </div>
          ) : (
            schedules.map((schedule, index) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${schedule.active ? 'bg-success' : 'bg-error'}`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-text">{schedule.name}</h3>
                      <p className="text-textSecondary">
                        {playlists.find(p => p.id === schedule.playlistId)?.name || 'Bilinmeyen Playlist'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleScheduleStatus(schedule.id, schedule.active)}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      {schedule.active ? (
                        <Pause className="w-5 h-5 text-textSecondary" />
                      ) : (
                        <Play className="w-5 h-5 text-textSecondary" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-background rounded-lg transition-colors">
                      <Edit className="w-5 h-5 text-textSecondary" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSchedule(schedule.id, schedule.name)}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-textSecondary" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-textSecondary mb-1">Zaman Aralığı</div>
                    <div className="flex items-center space-x-2 text-text">
                      <Clock className="w-4 h-4" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-textSecondary mb-1">Günler</div>
                    <div className="flex flex-wrap gap-1">
                      {schedule.days && schedule.days.map(day => (
                        <span key={day} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-textSecondary mb-1">Cihazlar</div>
                    <div className="text-text">
                      {schedule.deviceIds ? schedule.deviceIds.length : 0} cihaz seçili
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-textSecondary">
                    <span className="font-medium">Başlangıç:</span> {format(schedule.startDate, 'dd.MM.yyyy', { locale: tr })} - 
                    <span className="font-medium ml-2">Bitiş:</span> {format(schedule.endDate, 'dd.MM.yyyy', { locale: tr })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
