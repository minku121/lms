import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    // Total Books
    const [books] = await db.query('SELECT COUNT(*) as total, SUM(stock) as stock, SUM(available) as available FROM books');
    const bookRows = books as RowDataPacket[];

    // Total Students
    const [students] = await db.query('SELECT COUNT(*) as total FROM students');
    const studentRows = students as RowDataPacket[];

    // Total Issued Books
    const [issued] = await db.query("SELECT COUNT(*) as total FROM issues WHERE status = 'issued'");
    const issuedRows = issued as RowDataPacket[];

    // Overdue Books (where due_date < current_date and status is issued)
    const [overdue] = await db.query("SELECT COUNT(*) as total FROM issues WHERE status = 'issued' AND due_date < CURDATE()");
    const overdueRows = overdue as RowDataPacket[];

    // Recent Circulation
    const [recent] = await db.query(`
      SELECT 
        s.name as student, 
        b.title as book, 
        i.status as type,
        i.issue_date,
        i.return_date
      FROM issues i
      JOIN books b ON i.book_id = b.id
      JOIN students s ON i.student_id = s.id
      ORDER BY i.id DESC
      LIMIT 5
    `);
    const recentRows = recent as RowDataPacket[];

    // Inventory Health (by category)
    const [categories] = await db.query(`
      SELECT 
        category as label,
        SUM(available) as available,
        SUM(stock) as stock
      FROM books
      GROUP BY category
    `);
    const categoryRows = categories as RowDataPacket[];

    return NextResponse.json({
      books: bookRows[0],
      students: studentRows[0],
      issued: issuedRows[0],
      overdue: overdueRows[0],
      recent: recentRows,
      categories: categoryRows.map(c => ({
        label: c.label,
        percentage: c.stock > 0 ? Math.round((c.available / c.stock) * 100) : 0
      }))
    });


  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
