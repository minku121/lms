import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface BookRow extends RowDataPacket {
  available: number;
}

interface IssueRow extends RowDataPacket {
  id: number;
  book_id: number;
  due_date: string;
}

export async function GET() {

  try {
    const [rows] = await db.query(`
      SELECT 
        i.*, 
        b.title as book_title, 
        s.name as student_name,
        s.reg_no as student_reg_no,
        s.roll_no as student_roll_no,
        s.branch as student_branch
      FROM issues i 
      JOIN books b ON i.book_id = b.id 
      JOIN students s ON i.student_id = s.id 
      ORDER BY i.issue_date DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Issuing book with data:', body);
    const { book_id, student_id, due_date } = body;
    
    if (!book_id || !student_id || !due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bookId = parseInt(book_id);
    const studentId = parseInt(student_id);
    
    if (isNaN(bookId) || isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid book or student ID' }, { status: 400 });
    }

    
    // Check if book is available
    const [books] = await db.query('SELECT available FROM books WHERE id = ?', [bookId]);
    const bookRows = books as BookRow[];
    const book = bookRows[0];
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.available <= 0) {
      return NextResponse.json({ error: 'Book currently out of stock' }, { status: 400 });
    }
    
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Issue book
      console.log(`Inserting issue record for book ${bookId} to student ${studentId}`);
      await connection.query(
        'INSERT INTO issues (book_id, student_id, issue_date, due_date, status) VALUES (?, ?, CURDATE(), ?, \'issued\')',
        [bookId, studentId, due_date]
      );

      
      // Update availability
      console.log(`Decreasing availability for book ${bookId}`);
      await connection.query('UPDATE books SET available = available - 1 WHERE id = ?', [bookId]);
      
      await connection.commit();
      console.log('Transaction committed successfully');
      return NextResponse.json({ message: 'Book issued successfully' }, { status: 201 });
    } catch (err: any) {
      console.error('Error during transaction:', err);
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Database Error in POST /api/issue:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}


export async function PUT(request: Request) {
  try {
    const { issue_id } = await request.json();
    
    // Get issue details
    const [issues] = await db.query('SELECT book_id, due_date FROM issues WHERE id = ?', [issue_id]);
    const issueRows = issues as IssueRow[];
    const issue = issueRows[0];


    
    if (!issue) {
      return NextResponse.json({ error: 'Issue record not found' }, { status: 404 });
    }
    
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Return book
      await connection.query(
        'UPDATE issues SET return_date = CURDATE(), status = \'returned\' WHERE id = ?',
        [issue_id]
      );

      
      // Update availability
      await connection.query('UPDATE books SET available = available + 1 WHERE id = ?', [issue.book_id]);
      
      await connection.commit();
      return NextResponse.json({ message: 'Book returned successfully' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
