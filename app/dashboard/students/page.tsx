'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  reg_no: string;
  roll_no: string;
  branch: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reg_no: '',
    roll_no: '',
    branch: ''
  });

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', reg_no: '', roll_no: '', branch: '' });
    setError('');
    setEditingId(null);
  };

  const handleAddClick = () => {
    setModalType('add');
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (student: Student) => {
    setModalType('edit');
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      reg_no: student.reg_no,
      roll_no: student.roll_no,
      branch: student.branch
    });
    setError('');
    setShowModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student? This will also delete their circulation history.')) return;
    
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (response.ok) {
        await fetchStudents();
      } else {
        alert(data.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('An unexpected error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const method = modalType === 'add' ? 'POST' : 'PUT';
    const payload = modalType === 'add' ? formData : { ...formData, id: editingId };

    try {
      const response = await fetch('/api/students', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        await fetchStudents();
      } else {
        setError(data.error || `Failed to ${modalType} student`);
      }
    } catch (error) {
      console.error(`Failed to ${modalType} student:`, error);
      setError('An unexpected error occurred');
    }
  };

  if (loading) {
    return <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Students...</div>;
  }

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Student Registry</h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Manage student profiles & identifiers</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Student
        </button>
      </header>

      {/* Student Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Name & Email</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Academic IDs</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Branch</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Phone</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{student.name}</div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{student.email}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-black text-zinc-300">Roll: {student.roll_no}</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Reg: {student.reg_no}</div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {student.branch}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-zinc-400">{student.phone || 'N/A'}</td>
                <td className="px-8 py-6">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEditClick(student)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                      title="Edit Student"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(student.id)}
                      className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                      title="Delete Student"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-white/10 p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-black text-white tracking-tight mb-8">
              {modalType === 'add' ? 'Register Student' : 'Edit Student Profile'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" required 
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" required
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                    placeholder="+91 9709701630"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Registration No</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                    placeholder="23155134013"
                    value={formData.reg_no}
                    onChange={(e) => setFormData({...formData, reg_no: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Roll Number</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                    placeholder="23623"
                    value={formData.roll_no}
                    onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Branch</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                    placeholder="Computer Science(IOT)"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  {modalType === 'add' ? 'Register Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
