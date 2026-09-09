import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Shield, Bell, Check, Building, GraduationCap } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.departmentName || 'Computer Science & Engineering');
  const [hostelBlock, setHostelBlock] = useState(user?.hostelBlock || 'Block B (Aryabhatta)');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '304');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsUrgentAlerts, setSmsUrgentAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      departmentName: department,
      hostelBlock,
      roomNumber,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          User Account & Campus Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your student credentials, physical campus location, and emergency alert preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity Card */}
        <Card className="p-6 space-y-5 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#14213d] to-[#fca311] p-0.5 flex items-center justify-center text-xl font-bold text-black shadow-lg">
              <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center text-[#fca311]">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#fca311]/15 text-[#fca311] border border-[#fca311]/30 font-bold uppercase tracking-wider">
                  {role}
                </span>
                <span className="text-xs text-slate-400">CampusPulse ID: {user?.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Campus Department / Major"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Hostel Block / Building"
              value={hostelBlock}
              onChange={(e) => setHostelBlock(e.target.value)}
            />
            <Input
              label="Room / Lab Number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>
        </Card>

        {/* Preferences Card */}
        <Card className="p-6 space-y-4 border border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Bell className="h-4 w-4 text-[#fca311]" />
            <span>Notification & Dispatch Preferences</span>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Status Progression Notifications</p>
                <p className="text-[11px] text-slate-400">Get notified when a technician is dispatched or issue resolved.</p>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="h-4 w-4 accent-[#fca311] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Campus Safety & Critical SMS Alerts</p>
                <p className="text-[11px] text-slate-400">Immediate broadcast for fire, electrical, or hazard advisories.</p>
              </div>
              <input
                type="checkbox"
                checked={smsUrgentAlerts}
                onChange={(e) => setSmsUrgentAlerts(e.target.checked)}
                className="h-4 w-4 accent-[#fca311] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Email Survey Invitations</p>
                <p className="text-[11px] text-slate-400">Receive alerts when new student opinion polls are opened.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 accent-[#fca311] rounded"
              />
            </label>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="accent" size="lg">
            <Check className="h-4 w-4" />
            <span>Save Profile Updates</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
