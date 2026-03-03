import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSyllabus } from '../features/syllabus/api/useSyllabus';
import { useBranches } from '../features/syllabus/hooks/useBranches'; // Import the new hook
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tab';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, BookPlus, GitBranch } from 'lucide-react';

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

  // New Branch/Subject State
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  // Hooks
  const { syllabus } = useSyllabus(branch, parseInt(semester));
  const { branches, loading: loadingBranches } = useBranches(); // Dynamic branches!

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const validatePin = () => {
    if (adminPin !== '1234') {
      setStatus({ type: 'error', message: 'Invalid Admin PIN' });
      return false;
    }
    return true;
  };

  // --- ACTION: Add New Branch ---
  const handleAddBranch = async () => {
    if (!validatePin()) return;
    if (!newBranchName || !newBranchCode) {
      setStatus({ type: 'error', message: 'Fill all branch details' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('branches').insert([
        { name: newBranchName, short_code: newBranchCode }
      ]);
      if (error) throw error;
      setStatus({ type: 'success', message: `Branch '${newBranchName}' added!` });
      setNewBranchName(''); setNewBranchCode('');
      // Force refresh page to reload branches list (simple way)
      window.location.reload(); 
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: Add New Subject ---
  const handleAddSubject = async () => {
    if (!validatePin()) return;
    if (!newSubjectName) {
      setStatus({ type: 'error', message: 'Subject name is required' });
      return;
    }
    setLoading(true);
    try {
      // 1. Create Subject
      const { data: subjectData, error: subError } = await supabase
        .from('subjects')
        .insert([{
          name: newSubjectName,
          code: newSubjectCode,
          branch: branch, // Uses the selected branch from dropdown
          semester: parseInt(semester),
          credits: 4
        }])
        .select()
        .single();

      if (subError) throw subError;

      // 2. Auto-create 4 empty units so it shows up in UI
      const unitsPayload = [1, 2, 3, 4].map(num => ({
        subject_id: subjectData.id,
        unit_number: num,
        title: `Unit ${num}: Introduction`
      }));

      const { error: unitError } = await supabase.from('units').insert(unitsPayload);
      if (unitError) throw unitError;

      setStatus({ type: 'success', message: `Subject '${newSubjectName}' created with 4 units!` });
      setNewSubjectName(''); setNewSubjectCode('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: Upload File ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!validatePin()) return;
    if (!file || !subjectName || !title) {
      setStatus({ type: 'error', message: 'Please fill all upload fields' });
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${title.replace(/\s+/g, '_')}.${fileExt}`;
      const filePath = `${branch}/${semester}/${subjectName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('study_materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('study_materials')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('study_materials').insert([{
        branch, semester: parseInt(semester), subject_name: subjectName, title, type, file_url: publicUrl,
      }]);

      if (dbError) throw dbError;

      setStatus({ type: 'success', message: 'File uploaded successfully!' });
      setTitle(''); setFile(null);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
      <Card className="w-full max-w-3xl p-8 border-border bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">Manage Materials & Curriculum</p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="gap-2">
              <UploadCloud className="w-4 h-4" /> Upload Materials
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <BookPlus className="w-4 h-4" /> Manage Curriculum
            </TabsTrigger>
          </TabsList>

          {/* Common Selectors for both tabs */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                <SelectContent>
                  {/* Dynamic Branches from DB */}
                  {branches.map(b => (
                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TAB 1: UPLOAD FILES */}
          <TabsContent value="upload" className="space-y-6">
            <div className="space-y-2">
              <Label>Subject (from Syllabus)</Label>
              <Select value={subjectName} onValueChange={setSubjectName}>
                <SelectTrigger>
                  <SelectValue placeholder={syllabus && syllabus.length > 0 ? "Select Subject" : "No subjects found"} />
                </SelectTrigger>
                <SelectContent>
                  {syllabus && syllabus.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Note">Notes / PDF</SelectItem>
                    <SelectItem value="PYQ">PYQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Unit 1 Notes" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>PDF File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer relative hover:bg-muted/50">
                <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {file ? <div className="flex items-center gap-2 text-primary"><FileText className="w-6 h-6" /><span className="font-medium">{file.name}</span></div> : <div className="text-muted-foreground"><UploadCloud className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Click to upload PDF</p></div>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Admin PIN</Label>
              <Input type="password" placeholder="Enter PIN" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} />
            </div>

            <Button onClick={handleUpload} className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Upload Material'}
            </Button>
          </TabsContent>

          {/* TAB 2: MANAGE CURRICULUM */}
          <TabsContent value="manage" className="space-y-8">
            
            {/* Section A: Add New Branch */}
            <div className="space-y-4 p-4 border border-border rounded-xl bg-card">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg">Add New Branch</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Branch Name (e.g. Civil Engineering)" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} />
                <Input placeholder="Short Code (e.g. CE)" value={newBranchCode} onChange={(e) => setNewBranchCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Admin PIN</Label>
                <Input type="password" placeholder="Enter PIN" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} />
              </div>
              <Button onClick={handleAddBranch} variant="outline" className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20" disabled={loading}>
                {loading ? 'Adding...' : 'Create New Branch'}
              </Button>
            </div>

            {/* Section B: Add New Subject */}
            <div className="space-y-4 p-4 border border-border rounded-xl bg-card">
               <div className="flex items-center gap-2 mb-2">
                <BookPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg">Add New Subject</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Adding to: <span className="font-bold text-primary">{branch}</span> - Semester {semester}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Subject Name (e.g. Fluid Mechanics)" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                <Input placeholder="Subject Code (e.g. CE-101)" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Admin PIN</Label>
                <Input type="password" placeholder="Enter PIN" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} />
              </div>

              <Button onClick={handleAddSubject} className="w-full" disabled={loading}>
                 {loading ? 'Creating...' : 'Create Subject & Auto-generate Units'}
              </Button>
            </div>
            
          </TabsContent>

          {/* Status Message */}
          {status.message && (
            <div className={`mt-6 p-3 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
              {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {status.message}
            </div>
          )}
        </Tabs>

      </Card>
    </div>
  );
}