import { supabase } from './supabase'

export async function checkTableSchema() {
  try {
    // Try to get the table structure by attempting to select with all possible columns
    const { data, error } = await supabase
      .from('simple_tasks')
      .select('*')
      .limit(1)

    console.log('Table schema check - sample data:', data)
    console.log('Table schema check - error:', error)

    // Try to insert a minimal task to see what works
    const testTask = {
      title: 'Test Task',
      description: 'Test Description',
      category: 'Work',
      difficulty: 1,
      user_id: 'test-user-id'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('simple_tasks')
      .insert([testTask])
      .select()

    console.log('Insert test result:', insertData)
    console.log('Insert test error:', insertError)

    return { data, error, insertData, insertError }
  } catch (err) {
    console.error('Schema check failed:', err)
    return { error: err }
  }
}