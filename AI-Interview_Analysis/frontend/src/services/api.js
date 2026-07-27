const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async startInterview() {
    try {
      const response = await fetch(`${BASE_URL}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to start interview: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  async evaluateAnswer(questionId, question, expectedAnswer, candidateAnswer) {
    try {
      const response = await fetch(`${BASE_URL}/interview/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          question_id: questionId,
          question: question,
          expected_answer: expectedAnswer,
          candidate_answer: candidateAnswer 
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate questions: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw error;
    }
  }

  async generateQuestions(jobRole, experienceLevel, jobDescription) {
    try {
      const response = await fetch(`${BASE_URL}/interview/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          job_role: jobRole,
          experience: experienceLevel,
          job_description: jobDescription 
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate questions: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  async endInterview(sessionId) {
    try {
      const response = await fetch(`${BASE_URL}/interview/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      if (!response.ok) {
        throw new Error(`Failed to end interview: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error ending interview:', error);
      throw error;
    }
  }

  async uploadRecording(sessionId, questionId, blob, fileType = 'video') {
    try {
      const formData = new FormData();
      // Generate a dynamic secure filename based on extension
      const extension = blob.type.split(';')[0].split('/')[1] || 'webm';
      const filename = `recording_${questionId}.${extension}`;
      
      formData.append('file', blob, filename);
      formData.append('session_id', sessionId);
      formData.append('question_id', questionId.toString());
      formData.append('file_type', fileType);

      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload recording: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  async checkBackendStatus() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); // 3-second timeout
      
      const response = await fetch(`${BASE_URL}/health`, {
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (!response.ok) return false;
      const result = await response.json();
      return result.success && result.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BASE_URL}/upload/resume`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload resume: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
