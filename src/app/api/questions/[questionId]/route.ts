import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET(
  request: NextRequest,
  // Correct the type signature - no Promise needed here for App Router
  { params }: { params: { questionId: string } } 
) {
  try {
    // The 'questionId' from the URL path
    const requestedId = params.questionId; 

    // Basic check if the ID looks like a simple string (e.g., "Q014")
    // This is a safety measure; the real fix is in the frontend.
    if (!requestedId || requestedId.includes('{')) {
       console.log(`❌ Invalid question ID format received: ${requestedId}`)
       return NextResponse.json(
         { error: 'Invalid question ID format' },
         { status: 400 } // Bad Request
       )
    }

    console.log(`📝 Fetching question with ID: ${requestedId}`)

    // Read questions.json file
    const jsonDirectory = path.join(process.cwd(), 'public')
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'questions.json'), 'utf8')
    const questions = JSON.parse(fileContents)

    // Find the question by ID using the corrected ID variable
    const question = questions.find((q: any) => q.question_id === requestedId)

    if (!question) {
      console.log(`❌ Question not found: ${requestedId}`)
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Found question: ${question.question}`)

    return NextResponse.json(question)
  } catch (error) {
    console.error('❌ Error fetching question:', error)
    // Avoid exposing internal error details unless necessary
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}