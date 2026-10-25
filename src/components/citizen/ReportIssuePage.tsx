import React, { useState, useEffect } from 'react';
import { useCivic } from '../../context/CivicContext';
import { ComplaintCategory, ComplaintPriority, AIAnalysisResult } from '../../types';
import { classifyComplaint, detectDuplicates } from '../../services/aiService';
import {
  Sparkles,
  MapPin,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Compass,
  ArrowRight,
  ShieldAlert,
  Flame,
  Info,
  Layers,
} from 'lucide-react';
import { CategoryBadge, PriorityBadge } from '../common/Badge';

// Sample presets for quick testing
const PRESET_LOCATIONS = [
  { name: 'Financial District (Market & 5th)', lat: 37.7758, lng: -122.4182, addr: '450 Market St & 5th Ave' },
  { name: 'SOMA Arts Hub (Mission & 4th)', lat: 37.7782, lng: -122.4150, addr: '820 Mission St, SOMA' },
  { name: 'Civic Center West (Franklin St)', lat: 37.7770, lng: -122.4240, addr: '520 Franklin St' },
  { name: 'Hayes Valley (Hayes & Laguna)', lat: 37.7760, lng: -122.4200, addr: '200 Hayes St' },
];

const PRESET_PHOTOS = [
  {
    name: 'Asphalt Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    title: 'Severe crater in vehicle lane',
  },
  {
    name: 'Overflowing Trash',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    title: 'Overflowing dumpster alleyway',
  },
  {
    name: 'Water Main Leak',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    title: 'Pressurized water bubbling up',
  },
  {
    name: 'Damaged Bench/Sign',
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    title: 'Broken park infrastructure',
  },
];

export const ReportIssuePage: React.FC = () => {
  const { addComplaint, complaints, viewComplaint, setActiveTab } = useCivic();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('road_damage');
  const [latitude, setLatitude] = useState<number>(37.7758);
  const [longitude, setLongitude] = useState<number>(-122.4182);
  const [address, setAddress] = useState('450 Market St & 5th Ave, Financial District');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // AI & validation states
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Duplicate warning state
  const [potentialDuplicates, setPotentialDuplicates] = useState<any[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Trigger AI categorization
  const handleAiAutoTriage = async () => {
    if (!title.trim() && !description.trim()) {
      setFormErrors((prev) => ({ ...prev, description: 'Enter a title or description first for AI analysis' }));
      return;
    }
    setFormErrors({});
    setIsAiClassifying(true);
    setAiError(null);

    try {
      const result = await classifyComplaint(title, description);
      setAiAnalysis(result);
      if (result.category) {
        setCategory(result.category);
      }
    } catch (err: any) {
      setAiError('AI classification timed out. You can manually select the category below.');
    } finally {
      setIsAiClassifying(false);
    }
  };

  // Real-time duplicate check when user finishes typing or changes category
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length > 5 && description.length > 10) {
        setIsCheckingDuplicates(true);
        try {
          const mockComplaint = {
            id: 'temp-new',
            title,
            description,
            category,
            latitude,
            longitude,
          };
          const dups = await detectDuplicates(mockComplaint, complaints);
          setPotentialDuplicates(dups.filter((d: any) => d.similarityScore >= 60));
        } catch (e) {
          // ignore
        } finally {
          setIsCheckingDuplicates(false);
        }
      } else {
        setPotentialDuplicates([]);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [title, description, category, latitude, longitude, complaints]);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle geolocation
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setLatitude(lat);
          setLongitude(lng);
          setAddress(`GPS Lat: ${lat}, Lng: ${lng} (Current Device Location)`);
        },
        (err) => {
          // Fallback location
          setAddress('Downtown Civic Center, 400 McAllister St');
          setLatitude(37.7749);
          setLongitude(-122.4194);
        }
      );
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Please provide a clear title for the problem';
    if (!description.trim()) errors.description = 'Please describe the problem in detail';
    if (!address.trim()) errors.address = 'Please specify the street location or address';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure AI analysis is performed if not already
      let finalAi = aiAnalysis;
      if (!finalAi) {
        finalAi = await classifyComplaint(title, description);
      }

      const priority: ComplaintPriority = finalAi.suggestedSeverity || 'medium';

      const created = await addComplaint({
        title,
        description,
        category,
        latitude,
        longitude,
        address,
        imageUrl: imagePreview || imageUrl || undefined,
        aiAnalysis: finalAi,
        suggestedPriority: priority,
        confirmedPriority: priority,
      });

      setSubmittedComplaintId(created.id);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Success Confirmation Modal */}
      {submittedComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-center space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Complaint Successfully Registered!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your civic report has been indexed and analyzed by AI. A municipal dispatcher has been alerted.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Tracking ID:</span>
                <span className="font-mono text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  {submittedComplaintId}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Classified Category:</span>
                <CategoryBadge category={category} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Assigned Priority:</span>
                <PriorityBadge priority={aiAnalysis?.suggestedSeverity || 'medium'} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Routing Department:</span>
                <span className="font-medium text-slate-800">{aiAnalysis?.routingDepartment || 'Public Works'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  viewComplaint(submittedComplaintId);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Track This Case</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSubmittedComplaintId(null);
                  setTitle('');
                  setDescription('');
                  setImagePreview('');
                  setImageUrl('');
                  setAiAnalysis(null);
                  setActiveTab('citizen-dashboard');
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            Citizen Action
          </span>
          <span className="text-xs text-slate-400">• Step 1 of 3</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Report a Civic Problem</h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit potholes, overflowing refuse, water pipe ruptures, or street outages. AI assists with hazard priority and municipal dispatch.
        </p>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Complaint Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep 8-inch pothole near crosswalk causing cars to swerve"
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
              formErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          {formErrors.title && <p className="text-[11px] text-rose-600 font-medium">{formErrors.title}</p>}
        </div>

        {/* Description & AI Triage Trigger */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAiAutoTriage}
              disabled={isAiClassifying}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-teal-50 border border-teal-300 text-teal-800 hover:bg-teal-100 transition-colors disabled:opacity-50"
            >
              {isAiClassifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Detect Category & Priority</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you see, approximate size or depth, if it is active or spreading, and any immediate hazards to pedestrians or drivers..."
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
              formErrors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            } focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed`}
          />
          {formErrors.description && <p className="text-[11px] text-rose-600 font-medium">{formErrors.description}</p>}
        </div>

        {/* Live AI Analysis Results Preview Card */}
        {aiAnalysis && (
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                  AI Triage Recommendation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {aiAnalysis.model}
                </span>
              </div>
              <PriorityBadge priority={aiAnalysis.suggestedSeverity} size="sm" />
            </div>

            <p className="text-xs text-teal-900 leading-relaxed">{aiAnalysis.explanation}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-teal-200/50">
              <div>
                <span className="text-[11px] font-bold text-teal-950 block mb-1">Safety Concerns Flagged:</span>
                <ul className="list-disc list-inside space-y-0.5 text-teal-900 text-[11px]">
                  {aiAnalysis.safetyConcerns.map((sc, i) => (
                    <li key={i}>{sc}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-950 block mb-1">Recommended Dispatch:</span>
                <p className="text-teal-900 text-[11px] font-medium">{aiAnalysis.routingDepartment}</p>
                <p className="text-[11px] text-teal-800 mt-0.5">{aiAnalysis.recommendedNextAction}</p>
              </div>
            </div>

            <div className="text-[10px] text-teal-700/80 italic border-t border-teal-200/40 pt-1">
              Note: AI outputs are recommendations to expedite municipal triage and require human dispatcher verification.
            </div>
          </div>
        )}

        {/* Live Duplicate Warning Preview */}
        {potentialDuplicates.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Potential Duplicate Issues Found Nearby ({potentialDuplicates.length})</span>
            </div>
            <p className="text-xs text-amber-800">
              Citizens have already reported a similar problem in this immediate vicinity. Submitting another report
              will automatically link it to help crews resolve it faster.
            </p>
            <div className="space-y-1.5 pt-1">
              {potentialDuplicates.map((dup, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">#{dup.matchedComplaintId}</span>
                      <span className="text-slate-600 line-clamp-1">{dup.matchedComplaint?.title}</span>
                    </div>
                    <div className="text-[11px] text-amber-700">
                      {dup.similarityScore}% similarity • {dup.distanceMeters}m away • {dup.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Civic Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'road_damage', label: 'Road Damage' },
              { id: 'waste_management', label: 'Waste Mgmt' },
              { id: 'water_leakage', label: 'Water Leakage' },
              { id: 'drainage', label: 'Drainage & Storm' },
              { id: 'streetlight_failure', label: 'Streetlight Out' },
              { id: 'public_infrastructure', label: 'Public Infra' },
            ].map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as ComplaintCategory)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/80 text-teal-950 font-bold ring-1 ring-teal-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <CategoryBadge category={cat.id as ComplaintCategory} size="sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Location & Coordinates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Location & Geotag <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Use Current Device Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or intersection..."
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              {formErrors.address && <p className="text-[11px] text-rose-600 font-medium">{formErrors.address}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                placeholder="Lat"
                className="w-1/2 px-2 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                title="Latitude"
              />
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                placeholder="Lng"
                className="w-1/2 px-2 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                title="Longitude"
              />
            </div>
          </div>

          {/* Location Presets for fast hackathon testing */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Test Location Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((loc, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setLatitude(loc.lat);
                    setLongitude(loc.lng);
                    setAddress(loc.addr);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Upload & Demo Image Presets */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Photo Evidence (Optional but recommended)
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-w-sm">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview('');
                  setImageUrl('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-6 text-center space-y-2 transition-colors bg-slate-50/50">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-600">
                <label className="font-bold text-teal-600 hover:underline cursor-pointer">
                  Upload an image file
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>{' '}
                or drag & drop
              </div>
              <p className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 10MB</p>
            </div>
          )}

          {/* Quick preset demo photos */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Or pick a sample hackathon evidence photo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_PHOTOS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setImagePreview(p.url);
                    setImageUrl(p.url);
                    if (!title) setTitle(p.title);
                  }}
                  className="p-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white text-left transition-colors flex items-center gap-2"
                >
                  <img src={p.url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-[11px] font-medium text-slate-700 truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Reports are immediately publicly verifiable on the Civic ledger.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Complaint...</span>
              </>
            ) : (
              <>
                <span>Submit Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
