/**
 * Job Market Platform — Configuration
 * =====================================
 * Centralized config for the public landing page.
 */

const CONFIG = {
  // Supabase
  supabaseUrl: 'https://kmcerovyblzxpvifygln.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttY2Vyb3Z5Ymx6eHB2aWZ5Z2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1OTQ5MzIsImV4cCI6MjEwMDE3MDkzMn0.o0cWuSoWs4M61muMdJCe3zsDSUX2QdLcWsZQtsKH838',

  // Company
  companyName: 'Job For You',
  companyTagline: 'Find Your Dream Career',

  // Pagination
  jobsPerPage: 12,

  // File uploads
  maxCvSizeMB: 10,
  allowedCvTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

  // Employment types (for UI labels)
  employmentTypes: {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    'contract': 'Contract',
    'temporary': 'Temporary',
    'internship': 'Internship',
    'freelance': 'Freelance'
  },

  // Experience levels (for UI labels)
  experienceLevels: {
    'entry': 'Entry Level',
    'junior': 'Junior',
    'mid': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Lead',
    'manager': 'Manager',
    'director': 'Director',
    'executive': 'Executive'
  },

  // Application statuses (for reference)
  applicationStatuses: {
    'new': 'New',
    'under_review': 'Under Review',
    'phone_screening': 'Phone Screening',
    'interview_scheduled': 'Interview Scheduled',
    'technical_interview': 'Technical Interview',
    'hr_interview': 'HR Interview',
    'offer_sent': 'Offer Sent',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'archived': 'Archived'
  }
};

window.shareJobUrl = async (url, title) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Job For You',
        text: 'Check out this open position!',
        url: url,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      alert('Job link copied to clipboard!');
    } catch (err) {
      alert('Unable to copy link.');
    }
  }
};
