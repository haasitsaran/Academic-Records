import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating career suggestions for user: ${user.id}`);

    // Get user preferences, achievements, and skills
    const [preferencesResult, achievementsResult, skillsResult] = await Promise.all([
      supabase.from('career_preferences').select('*').eq('student_id', user.id).single(),
      supabase.from('achievements').select('*').eq('student_id', user.id).eq('status', 'approved'),
      supabase.from('student_skills').select('*').eq('student_id', user.id)
    ]);

    const preferences = preferencesResult.data;
    const achievements = achievementsResult.data || [];
    const skills = skillsResult.data || [];

    if (!preferences) {
      return new Response(JSON.stringify({ error: 'No career preferences found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for Gemini AI
    const userProfile = {
      interests: preferences.interests || [],
      skills: preferences.skills || [],
      preferred_industries: preferences.preferred_industries || [],
      career_goals: preferences.career_goals || '',
      technical_skills: skills.map(s => ({ name: s.skill_name, level: s.proficiency_level })),
      achievements: achievements.map(a => ({ 
        title: a.title, 
        type: a.achievement_type, 
        category: a.category 
      }))
    };

    const prompt = `Based on the following student profile, provide 3-5 personalized career suggestions with detailed analysis:

Student Profile:
- Interests: ${userProfile.interests.join(', ')}
- Skills: ${userProfile.skills.join(', ')}
- Preferred Industries: ${userProfile.preferred_industries.join(', ')}
- Career Goals: ${userProfile.career_goals}
- Technical Skills: ${userProfile.technical_skills.map(s => `${s.name} (${s.level})`).join(', ')}
- Achievements: ${userProfile.achievements.map(a => `${a.title} (${a.type})`).join(', ')}

For each career suggestion, provide:
1. Career title
2. Match percentage (0-100)
3. Detailed reasoning (2-3 sentences)
4. Required skills (array of skills)
5. Suggested courses (array of course names)

Respond in JSON format with an array of career suggestions.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response:', geminiData);

    let suggestions;
    try {
      const generatedText = geminiData.candidates[0].content.parts[0].text;
      // Extract JSON from the response (removing any markdown formatting)
      const jsonMatch = generatedText.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [null, generatedText];
      suggestions = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Fallback suggestions
      suggestions = [
        {
          career_title: "Software Developer",
          match_percentage: 85,
          reasoning: "Based on your technical skills and interests in programming, this role aligns well with your profile.",
          required_skills: ["Programming", "Problem Solving", "Software Design"],
          suggested_courses: ["Advanced Programming", "Software Architecture", "System Design"]
        }
      ];
    }

    // Clear existing suggestions and insert new ones
    await supabase.from('career_suggestions').delete().eq('student_id', user.id);
    
    const insertPromises = suggestions.map((suggestion: any) => {
      return supabase.from('career_suggestions').insert({
        student_id: user.id,
        suggested_career: suggestion.career_title || suggestion.suggested_career,
        match_percentage: suggestion.match_percentage,
        reasoning: suggestion.reasoning,
        required_skills: suggestion.required_skills,
        suggested_courses: suggestion.suggested_courses
      });
    });

    await Promise.all(insertPromises);

    console.log(`Generated ${suggestions.length} career suggestions for user: ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      suggestions_count: suggestions.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-career-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});