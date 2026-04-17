import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM students ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Database Error in GET /api/students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, reg_no, roll_no, branch } = body;

    if (!name || !email || !reg_no || !roll_no || !branch) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.query(
      'INSERT INTO students (name, email, phone, reg_no, roll_no, branch) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, reg_no, roll_no, branch]
    );

    return NextResponse.json({ message: 'Student added successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Database Error in POST /api/students:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Student with this Email, Reg No, or Roll No already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, reg_no, roll_no, branch } = body;

    if (!id || !name || !email || !reg_no || !roll_no || !branch) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.query(
      'UPDATE students SET name = ?, email = ?, phone = ?, reg_no = ?, roll_no = ?, branch = ? WHERE id = ?',
      [name, email, phone, reg_no, roll_no, branch, id]
    );

    return NextResponse.json({ message: 'Student updated successfully' });
  } catch (error: any) {
    console.error('Database Error in PUT /api/students:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Duplicate Email, Reg No, or Roll No' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing student ID' }, { status: 400 });
    }

    // Check if student has active issues
    const [issues] = await db.query("SELECT COUNT(*) as count FROM issues WHERE student_id = ? AND status = 'issued'", [id]);
    const issueCount = (issues as any[])[0].count;

    if (issueCount > 0) {
      return NextResponse.json({ error: 'Cannot delete student with active book issues' }, { status: 400 });
    }

    // Delete returned issues first
    await db.query('DELETE FROM issues WHERE student_id = ?', [id]);
    
    // Delete student
    await db.query('DELETE FROM students WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error('Database Error in DELETE /api/students:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

