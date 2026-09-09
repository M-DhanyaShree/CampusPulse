import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MOCK_COMPLAINTS } from '../../lib/api';
import { Complaint, ComplaintUrgency } from '../../types';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Copy,
  ThumbsUp,
  UploadCloud,
  FileText,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const CATEGORIES = [
  'IT Infrastructure & Wi-Fi',
  'Hostel & Residential Life',
  'Cafeteria & Food Services',
  'Classroom & Academic Labs',
  'Library Services',
  'Campus Security & Safety',
  'Transport & Parking',
  'Sanitation & Environment',
  'Administration & Fees',
];

export const SubmitComplaintPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Hostel Block B, Room 304');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [urgency, setUrgency] = useState<ComplaintUrgency>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time AI State
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiDetectedUrgency, setAiDetectedUrgency] = useState<ComplaintUrgency>('medium');
  const [isEmergency, setIsEmergency] = useState(false);
  const [potentialDuplicates, setPotentialDuplicates] = useState<
    Array<{ complaint: Complaint; similarity: number }>
  >([]);

  // Real-time AI Inference simulation / evaluation on input change
  useEffect(() => {
    const fullText = `${title} ${description}`.toLowerCase();
    if (fullText.trim().length < 8) {
      setPotentialDuplicates([]);
      setIsEmergency(false);
      setAiConfidence(0);
      return;
    }

    // 1. Emergency detection
    const emergencyWords = ['fire', 'shock', 'electrocution', 'gas leak', 'spark', 'flooding', 'hazard'];
    const hasEmergency = emergencyWords.some((w) => fullText.includes(w));
    setIsEmergency(hasEmergency);

    // 2. Category inference (simulating facebook/bart-large-mnli)
    let bestCat = selectedCategory;
    let detectedUrgency: ComplaintUrgency = 'medium';

    if (/(wifi|internet|router|lan|network|portal|login)/.test(fullText)) {
      bestCat = 'IT Infrastructure & Wi-Fi';
      detectedUrgency = 'high';
    } else if (/(leak|water|pipe|geyser|bathroom|washroom|warden|room|bed)/.test(fullText)) {
      bestCat = 'Hostel & Residential Life';
      detectedUrgency = hasEmergency ? 'critical' : 'high';
    } else if (/(mess|food|canteen|cafeteria|meal|breakfast|hygiene)/.test(fullText)) {
      bestCat = 'Cafeteria & Food Services';
      detectedUrgency = 'medium';
    } else if (/(projector|ac|bench|board|lab|speaker)/.test(fullText)) {
      bestCat = 'Classroom & Academic Labs';
      detectedUrgency = 'medium';
    } else if (/(security|theft|guard|gate|fight)/.test(fullText)) {
      bestCat = 'Campus Security & Safety';
      detectedUrgency = 'critical';
    }

    setSelectedCategory(bestCat);
    setAiDetectedUrgency(hasEmergency ? 'critical' : detectedUrgency);
    setUrgency(hasEmergency ? 'critical' : detectedUrgency);
    setAiConfidence(0.94);

    // 3. Duplicate check (simulating sentence-transformers/all-MiniLM-L6-v2)
    const tokens = new Set(fullText.split(/\s+/).filter((t) => t.length > 3));
    const duplicates: Array<{ complaint: Complaint; similarity: number }> = [];

    MOCK_COMPLAINTS.forEach((c) => {
      const docTokens = new Set(`${c.title} ${c.description}`.toLowerCase().split(/\s+/));
      let match = 0;
      tokens.forEach((t) => {
        if (docTokens.has(t)) match++;
      });
      const sim = Math.min(0.95, (match / (tokens.size || 1)) * 0.85 + 0.15);
      if (sim > 0.45) {
        duplicates.push({ complaint: c, similarity: Math.round(sim * 100) });
      }
    });

    duplicates.sort((a, b) => b.similarity - a.similarity);
    setPotentialDuplicates(duplicates.slice(0, 2));
  }, [title, description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Validation Error', 'Please provide a title and detailed description.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicketCode = `CP-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newComplaint: Complaint = {
        id: `c-${Date.now()}`,
        trackingCode: newTicketCode,
        title,
        description,
        category: selectedCategory,
        urgency,
        urgencyScore: urgency === 'critical' ? 0.98 : urgency === 'high' ? 0.78 : 0.5,
        status: 'submitted',
        location,
        studentId: user?.id || 'u-1',
        studentName: user?.name || 'Aarav Sharma',
        departmentName: selectedCategory,
        upvotes: 1,
        upvotedBy: [user?.id || 'u-1'],
        aiClassificationConfidence: aiConfidence || 0.92,
        aiSummary: description.slice(0, 120),
        createdAt: new Date().toISOString(),
      };

      MOCK_COMPLAINTS.unshift(newComplaint);
      setIsSubmitting(false);
      showToast(
        'Complaint Lodged Successfully!',
        `Tracking ID: ${newTicketCode}. Routed to ${selectedCategory}.`,
        'success'
      );
      navigate('/student/complaints');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Lodge a Campus Grievance
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Our AI pipeline automatically classifies your issue, measures urgency, and cross-references existing campus tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 Cols */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
            {/* Title */}
            <Input
              label="Complaint Title"
              hint="Keep it concise and location-specific"
              placeholder="e.g. Wi-Fi router flashing red on 2nd floor corridor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description */}
            <Textarea
              label="Detailed Description"
              hint="Mention exact symptoms, timing, and impact"
              rows={4}
              placeholder="Describe the issue in detail. For emergencies (fire, electrical short circuit, gas leak), please state immediately..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* Location & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Campus Location / Room"
                placeholder="e.g. Hostel Block B, Room 304"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Department Category</span>
                  {aiConfidence > 0 && (
                    <span className="text-[#fca311] font-semibold text-[11px] flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Predicted ({Math.round(aiConfidence * 100)}%)
                    </span>
                  )}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 rounded-xl glass-input px-3.5 py-2 text-sm text-white bg-slate-900 border border-white/10 focus:border-[#fca311]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Urgency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Priority & Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as ComplaintUrgency[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition border text-center ${
                      urgency === level
                        ? level === 'critical'
                          ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-md shadow-rose-950/40'
                          : level === 'high'
                          ? 'bg-amber-950 text-amber-300 border-amber-500'
                          : 'bg-[#14213d] text-[#fca311] border-[#fca311]'
                        : 'bg-slate-900/60 text-slate-400 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Attachment Mock Upload */}
            <div className="p-4 rounded-xl border border-dashed border-white/15 bg-slate-950/40 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-[#fca311]/50 transition">
              <UploadCloud className="h-7 w-7 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-white">
                  Attach Photo / Proof (Optional)
                </p>
                <p className="text-[10px] text-slate-400">
                  Drag & drop PNG, JPG, or PDF up to 10MB
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              <span>Submit & Route to Department</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Right AI Co-Pilot & Real-time Insight Panel */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4 border border-[#fca311]/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <div className="p-1.5 rounded-lg bg-[#fca311]/20 text-[#fca311]">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  CampusPulse AI Assistant
                </h4>
                <p className="text-[10px] text-slate-400">Live Inference Stream</p>
              </div>
            </div>

            {/* Emergency Alert indicator */}
            {isEmergency ? (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-start gap-2.5 text-xs text-rose-200">
                <Flame className="h-4 w-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="font-bold text-rose-300 block">
                    Critical Life-Safety Pattern Detected!
                  </span>
                  Your complaint will be automatically escalated directly to the emergency response team.
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400">Predicted Department:</span>
                <span className="font-bold text-[#fca311] truncate max-w-[140px]">
                  {selectedCategory}
                </span>
              </div>
            )}

            {/* Duplicate Detection Alert */}
            {potentialDuplicates.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Potential Duplicate Detected ({potentialDuplicates[0].similarity}% Match)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A similar complaint was already submitted. Upvoting the existing ticket pools community demand and triggers SLA escalation:
                </p>

                {potentialDuplicates.map(({ complaint, similarity }) => (
                  <div
                    key={complaint.id}
                    className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-300 font-bold">{complaint.trackingCode}</span>
                      <span className="text-amber-400 font-bold">{similarity}% match</span>
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-1">
                      {complaint.title}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">{complaint.upvotes} upvotes</span>
                      <button
                        type="button"
                        onClick={() => {
                          complaint.upvotes += 1;
                          showToast('Ticket Upvoted', `Added your support to ${complaint.trackingCode}`, 'success');
                          navigate('/student/complaints');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#fca311] text-black font-bold hover:brightness-110"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>Upvote Existing</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Model Architecture Note */}
            <div className="pt-2 text-[10px] text-slate-500 space-y-1">
              <p>• Zero-Shot Classifier: facebook/bart-large-mnli</p>
              <p>• Semantic Embeddings: sentence-transformers/all-MiniLM-L6-v2</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
