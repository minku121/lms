import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface BookRow extends RowDataPacket {
  id: number;
  stock: number;
  available: number;
}

export async function GET() {

  try {
    const [rows] = await db.query('SELECT * FROM books');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Adding book with data:', body);
    const { title, author, isbn, stock, category } = body;
    
    if (!title || !author || !isbn || !stock) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stockNum = parseInt(stock);

    // Check if book exists by ISBN
    const [existing] = await db.query('SELECT id, stock, available FROM books WHERE isbn = ?', [isbn]);
    const existingRows = existing as BookRow[];
    
    if (existingRows.length > 0) {
      // Update stock
      const book = existingRows[0];
      const newStock = book.stock + stockNum;
      const newAvailable = book.available + stockNum;
      
      console.log(`Updating existing book ${book.id}. New stock: ${newStock}`);
      await db.query('UPDATE books SET stock = ?, available = ? WHERE id = ?', [newStock, newAvailable, book.id]);
      return NextResponse.json({ message: 'Stock updated successfully' });
    } else {
      // Insert new book
      console.log('Inserting new book record');
      await db.query(
        'INSERT INTO books (title, author, isbn, stock, available, category) VALUES (?, ?, ?, ?, ?, ?)',
        [title, author, isbn, stockNum, stockNum, category]
      );
      return NextResponse.json({ message: 'Book added successfully' }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Database Error in POST /api/books:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, author, isbn, stock, category } = body;
    
    if (!id || !title || !author || !isbn || !stock) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stockNum = parseInt(stock);

    // Get current book to adjust availability
    const [current] = await db.query('SELECT stock, available FROM books WHERE id = ?', [id]);
    const currentRows = current as BookRow[];
    if (currentRows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = currentRows[0];
    const stockDiff = stockNum - book.stock;
    const newAvailable = book.available + stockDiff;

    if (newAvailable < 0) {
      return NextResponse.json({ error: 'Cannot reduce stock below issued amount' }, { status: 400 });
    }

    await db.query(
      'UPDATE books SET title = ?, author = ?, isbn = ?, stock = ?, available = ?, category = ? WHERE id = ?',
      [title, author, isbn, stockNum, newAvailable, category, id]
    );

    return NextResponse.json({ message: 'Book updated successfully' });
  } catch (error: any) {
    console.error('Database Error in PUT /api/books:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing book ID' }, { status: 400 });
    }

    // Check if book has active issues
    const [issues] = await db.query("SELECT COUNT(*) as count FROM issues WHERE book_id = ? AND status = 'issued'", [id]);
    const issueCount = (issues as any[])[0].count;

    if (issueCount > 0) {
      return NextResponse.json({ error: 'Cannot delete book with active issues' }, { status: 400 });
    }

    // Delete related records in issues first if any (returned ones)
    await db.query('DELETE FROM issues WHERE book_id = ?', [id]);
    
    // Delete the book
    await db.query('DELETE FROM books WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error: any) {
    console.error('Database Error in DELETE /api/books:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}


