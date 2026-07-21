/**
 * Job Market Platform — Supabase Client Configuration
 * ====================================================
 * This module initializes the Supabase JS client for the public landing page.
 * It uses the anon (publishable) key which is safe to expose in client-side code.
 * All data access is governed by Row Level Security (RLS) policies on the server.
 */

const SUPABASE_URL = 'https://kmcerovyblzxpvifygln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttY2Vyb3Z5Ymx6eHB2aWZ5Z2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1OTQ5MzIsImV4cCI6MjEwMDE3MDkzMn0.o0cWuSoWs4M61muMdJCe3zsDSUX2QdLcWsZQtsKH838';

// Initialize the Supabase client
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================================================
// PUBLIC API HELPERS
// =============================================================================

/**
 * Fetch all published jobs with company info
 * @param {Object} filters - { company, location, employment_type, experience_level, is_remote, search }
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Results per page
 */
async function fetchJobs(filters = {}, page = 1, pageSize = 12) {
  // If there's a search query, use the RPC full-text search function
  if (filters.search && filters.search.trim()) {
    const { data, error } = await db.rpc('search_jobs', {
      search_query: filters.search.trim()
    });
    if (error) throw error;
    return { data: data || [], count: data?.length || 0 };
  }

  // Otherwise, query the published jobs view with filters
  let query = db
    .from('v_published_jobs')
    .select('*', { count: 'exact' });

  if (filters.company) {
    query = query.eq('company_name', filters.company);
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.employment_type) {
    query = query.eq('employment_type', filters.employment_type);
  }
  if (filters.experience_level) {
    query = query.eq('experience_level', filters.experience_level);
  }
  if (filters.is_remote !== undefined) {
    query = query.eq('is_remote', filters.is_remote);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], count };
}

/**
 * Fetch a single job by slug (for job details page)
 * @param {string} slug
 */
async function fetchJobBySlug(slug) {
  const { data, error } = await db
    .from('v_published_jobs')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch active companies (for filter dropdowns)
 */
async function fetchCompanies() {
  const { data, error } = await db
    .from('v_jobs_by_company')
    .select('company_name')
    .order('company_name');
  if (error) throw error;
  return data || [];
}

/**
 * Upload a CV file to Supabase Storage
 * @param {File} file
 * @returns {string} Public URL of the uploaded file
 */
async function uploadCV(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `applications/${fileName}`;

  const { data, error } = await db.storage
    .from('cv')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Return the path (HR will access via authenticated signed URL)
  return filePath;
}

/**
 * Submit a job application via RPC
 * @param {Object} application - All application fields
 * @returns {string} Application ID
 */
async function submitApplication(application) {
  const { data, error } = await db.rpc('submit_application', {
    p_job_id: application.job_id,
    p_first_name: application.first_name,
    p_last_name: application.last_name,
    p_email: application.email,
    p_phone: application.phone || null,
    p_linkedin: application.linkedin || null,
    p_portfolio: application.portfolio || null,
    p_experience_years: application.experience_years || null,
    p_current_company: application.current_company || null,
    p_current_position: application.current_position || null,
    p_expected_salary: application.expected_salary || null,
    p_notice_period: application.notice_period || null,
    p_cover_letter: application.cover_letter || null,
    p_notes: application.notes || null,
    p_cv_url: application.cv_url || null,
    p_consent: application.consent || false
  });

  if (error) throw error;
  return data; // Returns the new applicant UUID
}

/**
 * Fetch platform statistics for the landing page
 */
async function fetchStats() {
  const { count: jobCount } = await db
    .from('v_published_jobs')
    .select('*', { count: 'exact', head: true });

  const companies = await fetchCompanies();

  return {
    openJobs: jobCount || 0,
    companies: companies.length,
  };
}
