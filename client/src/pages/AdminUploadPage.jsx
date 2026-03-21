import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useSyllabus } from '../features/syllabus/api/useSyllabus';
import { useBranches } from '../features/syllabus/hooks/useBranches';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tab';
import { 
  UploadCloud, FileText, CheckCircle, AlertCircle, 
  BookPlus, GitBranch, Layers, ListPlus, Youtube 
} from 'lucide-react';

export function AdminUploadPage() {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Shared State
  const [branch, setBranch] = useState('Computer Science Engineering');
  const [semester, setSemester] = useState('3');
  const [adminPin, setAdminPin] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Upload State
  const [subjectName, setSubjectName] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Note');
  const [file, setFile] = useState(null);

  // New Branch/Subject/Unit State
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  
  const [targetSubject, setTargetSubject] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [unitTitle, setUnitTitle] = useState('');

  // NEW: Add Topic State
  const [topicSubject, setTopicSubject] = useState('');
  const [topicUnitId, setTopicUnitId] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicYoutubeUrl, setTopicYoutubeUrl] = useState('');

  // Hooks
  const { syllabus } = useSyllabus(branch, parseInt(semester));
  const { branches } = useBranches();

  // Helper: Get units for the selected subject (for the Topic section)
  const availableUnits = useMemo(() => {
    if (!topicSubject || !syllabus) return [];
    const subj = syllabus.find(s => s.name === topicSubject);
    return subj ? subj.units : [];
  }, [topicSubject, syllabus]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const validatePin = () => {
    // Grab the PIN from the .env file. 
    // We keep '1234' as a fallback just in case the .env file fails to load.
    const correctPin = import.meta.env.VITE_ADMIN_PIN || '1234';

    if (adminPin !== correctPin) {
      setStatus({ type: 'error', message: 'Invalid Admin PIN' });
      return false;
    }
    return true;
  };

  // --- 1. Add Branch ---
  const handleAddBranch = async () => {
    if (!validatePin()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('branches').insert([{ name: newBranchName, short_code: newBranchCode }]);
      if (error) throw error;
      setStatus({ type: 'success', message: `Branch '${newBranchName}' added!` });
      setNewBranchName(''); setNewBranchCode('');
      window.location.reload(); 
    } catch (err) { setStatus({ type: 'error', message: err.message }); } finally { setLoading(false); }
  };

  // --- 2. Add Subject ---
  const handleAddSubject = async () => {
    if (!validatePin()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('subjects').insert([{
        name: newSubjectName, code: newSubjectCode, branch, semester: parseInt(semester), credits: 4
      }]);
      if (error) throw error;
      setStatus({ type: 'success', message: `Subject '${newSubjectName}' created!` });
      setNewSubjectName(''); setNewSubjectCode('');
    } catch (err) { setStatus({ type: 'error', message: err.message }); } finally { setLoading(false); }
  };

  // --- 3. Add Unit ---
  const handleAddUnit = async () => {
    if (!validatePin()) return;
    setLoading(true);
    try {
      const selectedSubjectObj = syllabus.find(s => s.name === targetSubject);
      if (!selectedSubjectObj) throw new Error("Subject not found.");

      const { error } = await supabase.from('units').insert([{
        subject_id: selectedSubjectObj.id, unit_number: parseInt(unitNumber), title: unitTitle
      }]);

      if (error) throw error;
      setStatus({ type: 'success', message: `Unit ${unitNumber} added!` });
      setUnitTitle(''); setUnitNumber(prev => (parseInt(prev) + 1).toString()); 
    } catch (err) { setStatus({ type: 'error', message: err.message }); } finally { setLoading(false); }
  };

  // --- 4. Add Topic (NEW) ---
  const handleAddTopic = async () => {
    if (!validatePin()) return;
    if (!topicUnitId || !topicName) {
      setStatus({ type: 'error', message: 'Select a unit and enter a topic name.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('topics').insert([{
        unit_id: topicUnitId,
        title: topicName,
        youtube_url: topicYoutubeUrl || null
      }]);

      if (error) throw error;

      setStatus({ type: 'success', message: `Topic '${topicName}' added!` });
      setTopicName(''); 
      setTopicYoutubeUrl('');
    } catch (err) { setStatus({ type: 'error', message: err.message }); } finally { setLoading(false); }
  };

  // --- 5. Upload File ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!validatePin()) return;
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${title.replace(/\s+/g, '_')}.${fileExt}`;
      const filePath = `${branch}/${semester}/${subjectName}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('study_materials').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('study_materials').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('study_materials').insert([{
        branch, semester: parseInt(semester), subject_name: subjectName, title, type, file_url: publicUrl,
      }]);
      if (dbError) throw dbError;

      setStatus({ type: 'success', message: 'File uploaded successfully!' });
      setTitle(''); setFile(null);
    } catch (error) { setStatus({ type: 'error', message: error.message }); } finally { setLoading(false); }
  };

  // Custom Input styling for dark mode
  const inputClass = "bg-[#0a0a0a] border-zinc-800 text-zinc-200 focus:border-teal-500/50 rounded-xl px-4 h-11 w-full";
  const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2";

  return (
    <div className="pb-12 bg-[#0a0a0a] min-h-screen text-zinc-100 font-sans px-4 sm:px-6 lg:px-8 py-8 flex items-start justify-center">
      <div className="w-full max-w-5xl p-6 sm:p-10 border border-zinc-800/60 bg-[#18181b] rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl shadow-inner">
            <UploadCloud className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-sm text-zinc-400">Manage Materials & Curriculum Engine</p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="w-full relative z-10" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#121212] border border-zinc-800/80 p-1 rounded-xl">
            <TabsTrigger value="manage" className="gap-2 text-zinc-400 data-[state=active]:bg-[#27272a] data-[state=active]:text-teal-400 rounded-lg py-2.5 font-semibold text-sm transition-all">
              <BookPlus className="w-4 h-4" /> Manage Curriculum
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2 text-zinc-400 data-[state=active]:bg-[#27272a] data-[state=active]:text-teal-400 rounded-lg py-2.5 font-semibold text-sm transition-all">
              <UploadCloud className="w-4 h-4" /> Upload Materials
            </TabsTrigger>
          </TabsList>

          {/* Global Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-6 bg-[#121212] rounded-2xl border border-zinc-800/80 shadow-inner">
            <div>
              <label className={labelClass}>Active Branch</label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                  {branches.map(b => <SelectItem key={b.id} value={b.name} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelClass}>Active Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TAB 1: MANAGE CURRICULUM */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* 1. Add Branch */}
              <div className="p-6 border border-zinc-800/60 rounded-2xl bg-[#121212] shadow-sm hover:border-zinc-700 transition-colors group space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg">Add Branch</h3>
                </div>
                <Input placeholder="Branch Name (e.g. Mechanical)" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} className={inputClass} />
                <Input placeholder="Short Code (e.g. ME)" value={newBranchCode} onChange={(e) => setNewBranchCode(e.target.value)} className={inputClass} />
                <Button onClick={handleAddBranch} disabled={loading} className="w-full bg-[#18181b] border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors h-11 rounded-xl">Create Branch</Button>
              </div>

              {/* 2. Add Subject */}
              <div className="p-6 border border-zinc-800/60 rounded-2xl bg-[#121212] shadow-sm hover:border-zinc-700 transition-colors group space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                    <BookPlus className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg">Add Subject</h3>
                </div>
                <Input placeholder="Subject Name" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} className={inputClass} />
                <Input placeholder="Subject Code (e.g. CS-201)" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} className={inputClass} />
                <Button onClick={handleAddSubject} disabled={loading} className="w-full bg-[#18181b] border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors h-11 rounded-xl">Create Subject</Button>
              </div>

              {/* 3. Add Unit */}
              <div className="p-6 border border-zinc-800/60 rounded-2xl bg-[#121212] shadow-sm hover:border-zinc-700 transition-colors group space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                    <Layers className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg">Add Unit</h3>
                </div>
                <Select value={targetSubject} onValueChange={setTargetSubject}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="Select Target Subject" /></SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                    {syllabus?.map(s => <SelectItem key={s.id} value={s.name} className="hover:bg-zinc-800 cursor-pointer">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-4 gap-3">
                  <Input type="number" placeholder="Unit #" className={`${inputClass} col-span-1`} value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} />
                  <Input placeholder="Unit Title" className={`${inputClass} col-span-3`} value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} />
                </div>
                <Button onClick={handleAddUnit} disabled={loading} className="w-full bg-[#18181b] border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors h-11 rounded-xl">Create Unit</Button>
              </div>

              {/* 4. Add Topic */}
              <div className="p-6 border border-zinc-800/60 rounded-2xl bg-[#121212] shadow-sm hover:border-zinc-700 transition-colors group space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                    <ListPlus className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg">Add Topic</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Select value={topicSubject} onValueChange={setTopicSubject}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="1. Subject" /></SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                      {syllabus?.map(s => <SelectItem key={s.id} value={s.name} className="hover:bg-zinc-800 cursor-pointer">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={topicUnitId} onValueChange={setTopicUnitId} disabled={!topicSubject}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="2. Unit" /></SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                      {availableUnits.map(u => (
                        <SelectItem key={u.id} value={u.id} className="hover:bg-zinc-800 cursor-pointer">Unit {u.unit_number}: {u.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input placeholder="Topic Name" value={topicName} onChange={(e) => setTopicName(e.target.value)} className={inputClass} />
                
                <div className="relative">
                  <Youtube className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <Input className={`${inputClass} pl-10`} placeholder="YouTube URL (Optional)" value={topicYoutubeUrl} onChange={(e) => setTopicYoutubeUrl(e.target.value)} />
                </div>
                
                <Button onClick={handleAddTopic} disabled={loading} className="w-full bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors h-11 rounded-xl">Add Topic</Button>
              </div>
            </div>
            
            {/* PIN Confirmation Section */}
            <div className="mt-8 p-6 bg-[#121212] border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
               <div>
                 <h4 className="font-bold text-white mb-1">Authorization Required</h4>
                 <p className="text-xs text-zinc-500">Please enter the Admin PIN to push changes to the live database.</p>
               </div>
               <Input type="password" placeholder="••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className={`${inputClass} w-full sm:w-48 text-center tracking-widest text-lg font-mono placeholder:tracking-normal placeholder:text-sm`} />
            </div>
          </TabsContent>

          {/* TAB 2: UPLOAD */}
          <TabsContent value="upload" className="space-y-6">
             <div className="p-6 border border-zinc-800/60 rounded-2xl bg-[#121212] shadow-sm space-y-6">
                <div>
                  <label className={labelClass}>Target Subject</label>
                  <Select value={subjectName} onValueChange={setSubjectName}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                      {syllabus?.map(s => <SelectItem key={s.id} value={s.name} className="hover:bg-zinc-800 cursor-pointer">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Material Type</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                        <SelectItem value="Note" className="hover:bg-zinc-800 cursor-pointer">Notes / PDF</SelectItem>
                        <SelectItem value="PYQ" className="hover:bg-zinc-800 cursor-pointer">Previous Year Questions (PYQ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={labelClass}>Document Title</label>
                    <Input placeholder="e.g., Mid-Sem Notes Ch 1-3" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>File Upload</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-800 border-dashed rounded-xl cursor-pointer bg-[#0a0a0a] hover:border-teal-500/50 hover:bg-[#0f0f0f] transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-8 h-8 mb-3 text-zinc-500" />
                        <p className="text-sm text-zinc-400 font-medium">
                          {file ? <span className="text-teal-400">{file.name}</span> : <span>Click to upload <span className="font-normal text-zinc-500">or drag and drop</span></span>}
                        </p>
                        {!file && <p className="text-xs text-zinc-600 mt-1">PDF up to 10MB</p>}
                      </div>
                      <Input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/80">
                  <label className={labelClass}>Admin PIN</label>
                  <Input type="password" placeholder="••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className={`${inputClass} mb-6`} />
                  
                  <button 
                    onClick={handleUpload} 
                    disabled={loading || !file || !title || !subjectName} 
                    className="w-full h-12 bg-gradient-to-r from-teal-400 to-emerald-600 hover:from-teal-500 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                  >
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <UploadCloud className="w-5 h-5" />}
                    {loading ? 'Uploading safely to Supabase...' : 'Publish to Live Database'}
                  </button>
                </div>
             </div>
          </TabsContent>

          {/* Success / Error Messages */}
          {status.message && (
            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 border ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}