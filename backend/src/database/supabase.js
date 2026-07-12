const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are not provided in environment variables.');
}

const supabase = createClient(supabaseUrl || 'http://placeholder.url', supabaseKey || 'placeholder_key');

module.exports = supabase;
