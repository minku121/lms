'use client';

import { useEffect, useState } from 'react';


interface Issue {
  id: number;
  book_title: string;
  student_name: string;
  student_reg_no: string;
  student_roll_no: string;
  student_branch: string;
  issue_date: string;
  due_date: string;
  status: string;
  return_date?: string;
}

interface Book {
  id: number;
  title: string;
  available: number;
}

interface Student {
  id: number;
  name: string;
  reg_no: string;
  roll_no: string;
  branch: string;
}

export default function IssueManagement() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [formData, setFormData] = useState({

    book_id: '',
    student_id: '',
    due_date: ''
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [issuesRes, booksRes, studentsRes] = await Promise.all([
          fetch('/api/issue'),
          fetch('/api/books'),
          fetch('/api/students')
        ]);
        const issuesData = await issuesRes.json();
        const booksData = await booksRes.json();
        const studentsData = await studentsRes.json();
        if (mounted) {
          setIssues(issuesData);
          setBooks(booksData.filter((b: Book) => b.available > 0));
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (mounted) {
          setIssues([
            {
              id: 1, book_title: 'The Great Gatsby', student_name: 'John Doe', issue_date: '2026-04-10', due_date: '2026-04-24', status: 'issued',
              student_reg_no: '',
              student_roll_no: '',
              student_branch: ''
            },
            {
              id: 2, book_title: 'Clean Code', student_name: 'Jane Smith', issue_date: '2026-04-01', due_date: '2026-04-15', status: 'returned', return_date: '2026-04-14',
              student_reg_no: '',
              student_roll_no: '',
              student_branch: ''
            },
          ]);
          setStudents([
            { id: 1, name: 'John Doe', reg_no: '2023001', roll_no: '101', branch: 'CS' },
            { id: 2, name: 'Jane Smith', reg_no: '2023002', roll_no: '102', branch: 'CS' },
            { id: 3, name: 'Bob Johnson', reg_no: '2023003', roll_no: '103', branch: 'CS' }
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => { mounted = false; };
  }, []);

  const refreshData = async () => {
    try {
      const [issuesRes, booksRes, studentsRes] = await Promise.all([
        fetch('/api/issue'),
        fetch('/api/books'),
        fetch('/api/students')
      ]);
      const issuesData = await issuesRes.json();
      const booksData = await booksRes.json();
      const studentsData = await studentsRes.json();
      setIssues(issuesData);
      setBooks(booksData.filter((b: Book) => b.available > 0));
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };





  if (loading) {
    return <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Circulation Data...</div>;
  }


  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        setShowIssueModal(false);
        setFormData({ book_id: '', student_id: '', due_date: '' });
        await refreshData();
      } else {
        setError(data.error || 'Failed to issue book');
      }

    } catch (error) {
      console.error('Failed to issue book:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      const response = await fetch('/api/issue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: id }),
      });
      if (response.ok) {
        await refreshData();
      }

    } catch (error) {
      console.error('Failed to return book:', error);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Circulation</h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Track book issues and returns</p>
        </div>
        <button 
          onClick={() => setShowIssueModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <span className="text-xl">🔄</span> Issue Book
        </button>
      </header>

      {/* Circulation Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Book & Student</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Issue Date</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Due Date</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Return Date</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{issue.book_title}</div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    ISSUED TO: {issue.student_name} ({issue.student_roll_no} | {issue.student_branch})
                  </div>
                  <div className="text-[9px] font-medium text-zinc-600 uppercase tracking-tight mt-0.5">
                    Reg: {issue.student_reg_no}
                  </div>
                </td>

                <td className="px-8 py-6 text-sm font-medium text-zinc-400">{issue.issue_date}</td>
                <td className="px-8 py-6 text-sm font-black text-zinc-300">{issue.due_date}</td>
                <td className="px-8 py-6 text-sm font-medium text-zinc-400">{issue.return_date || '-'}</td>
                <td className="px-8 py-6">
                  {issue.status === 'issued' ? (
                    <button 
                      onClick={() => handleReturn(issue.id)}
                      className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all"
                    >
                      Process Return
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      Completed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-white/10 p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-black text-white tracking-tight mb-8">Issue Circulation</h2>
            <form onSubmit={handleIssue} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <div>

                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Select Book</label>
                <select 
                  required
                  className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  value={formData.book_id}
                  onChange={(e) => setFormData({...formData, book_id: e.target.value})}
                >
                  <option value="" className="bg-zinc-900 text-white">Choose a book...</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id} className="bg-zinc-900 text-white">{book.title} ({book.available} left)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Student</label>
                <select 
                  required
                  className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                >
                  <option value="" className="bg-zinc-900 text-white">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id} className="bg-zinc-900 text-white">
                      {student.name} ({student.roll_no} - {student.branch})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Return Due Date</label>
                <input 
                  type="date" required
                  className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
