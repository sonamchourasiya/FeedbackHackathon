import { db } from './db.js';

// Function to create a new feedback template
export const createTemplate = async (template_name, created_by) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO feedback_templates (template_name, created_by) VALUES (?, ?)`,
      [template_name, created_by]
    );
    return result.insertId; // Return the ID of the newly created template
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error('Could not create template'); // Throw an error to be handled by the caller
  }
};

// Function to add questions to a specific template
export const addQuestions = async (template_id, questions) => {
  try {
    const promises = questions.map(q => 
      db.execute(
        `INSERT INTO template_questions (template_id, question_text) VALUES (?, ?)`,
        [template_id, q]
      )
    );
    await Promise.all(promises); // Execute all insert operations concurrently
  } catch (error) {
    console.error('Error adding questions:', error);
    throw new Error('Could not add questions to template'); // Throw an error to be handled by the caller
  }
};

// Function to get questions for a specific template
export const getTemplateQuestions = async (template_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT question_id, question_text FROM template_questions WHERE template_id = ?`,
      [template_id]
    );
    return rows; // Return the retrieved questions
  } catch (error) {
    console.error('Error fetching template questions:', error);
    throw new Error('Could not fetch questions for template'); // Throw an error to be handled by the caller
  }
};
