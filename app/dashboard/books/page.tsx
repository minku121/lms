'use client';

import { useEffect, useState } from 'react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  stock: number;
  available: number;
  category: string;
}

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    stock: '',
    category: 'Fiction'
  });

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', author: '', isbn: '', stock: '', category: 'Fiction' });
    setError('');
    setEditingId(null);
  };

  const handleAddClick = () => {
    setModalType('add');
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (book: Book) => {
    setModalType('edit');
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      stock: book.stock.toString(),
      category: book.category
    });
    setError('');
    setShowModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book? This will also delete related returned issue records.')) return;
    
    try {
      const response = await fetch(`/api/books?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (response.ok) {
        await fetchBooks();
      } else {
        alert(data.error || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('An unexpected error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const method = modalType === 'add' ? 'POST' : 'PUT';
    const payload = modalType === 'add' ? formData : { ...formData, id: editingId };

    try {
      const response = await fetch('/api/books', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        await fetchBooks();
      } else {
        setError(data.error || `Failed to ${modalType} book`);
      }
    } catch (error) {
      console.error(`Failed to ${modalType} book:`, error);
      setError('An unexpected error occurred');
    }
  };

  if (loading) {
    return <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Books...</div>;
  }

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Inventory</h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Manage your book stock & collection</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Book
        </button>
      </header>

      {/* Book Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Book Title</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Author</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Stock</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Available</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{book.title}</div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">ISBN: {book.isbn}</div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-zinc-400">{book.author}</td>
                <td className="px-8 py-6 text-sm font-black text-zinc-300">{book.stock}</td>
                <td className="px-8 py-6 text-sm font-black text-zinc-300">{book.available}</td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {book.category}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEditClick(book)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                      title="Edit Book"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(book.id)}
                      className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                      title="Delete Book"
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
              {modalType === 'add' ? 'Add to Inventory' : 'Edit Book Details'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Book Title</label>
                  <input 
                    type="text" required 
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="The Clean Coder"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Author</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Robert Martin"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">ISBN</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="978-0137081073"
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Stock Amount</label>
                  <input 
                    type="number" required
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="5"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select 
                    className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Programming">Programming</option>
                    <option value="Science">Science</option>
                    <option value="Psychology">Psychology</option>
                  </select>
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
                  {modalType === 'add' ? 'Confirm Stock' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
