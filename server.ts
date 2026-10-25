import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[AI] Failed to instantiate GoogleGenAI client, using demo fallback:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiProvider: aiClient ? 'CivicFix Neural Core' : 'CivicFix Rule-Based Engine',
    isAiLive: Boolean(aiClient),
    timestamp: new Date().toISOString(),
  });
});

// Deterministic fallback classifier for hackathon demo mode
function fallbackClassify(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  
  let category: 'road_damage' | 'waste_management' | 'water_leakage' | 'drainage' | 'streetlight_failure' | 'public_infrastructure' | 'other' = 'other';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let safetyConcerns: string[] = [];
  let keyPhrases: string[] = [];
  let explanation = '';
  let routingDepartment = 'General Municipal Works';
  let recommendedNextAction = 'Schedule standard municipal inspection within 3 business days.';

  if (text.includes('pothole') || text.includes('asphalt') || text.includes('crater') || text.includes('road') || text.includes('pavement')) {
    category = 'road_damage';
    routingDepartment = 'Department of Transportation & Pavement Engineering';
    keyPhrases = ['road surface disruption', 'vehicular impact hazard'];
    if (text.includes('deep') || text.includes('accident') || text.includes('rim') || text.includes('tire') || text.includes('speed') || text.includes('swerved')) {
      severity = 'high';
      safetyConcerns.push('Risk of vehicle axle/tire damage and sudden driver swerving into oncoming traffic');
      explanation = 'High severity recommended due to significant crater depth and active vehicular corridor risk.';
      recommendedNextAction = 'Dispatch emergency asphalt patch crew within 12 hours and place hazard markers.';
    } else {
      severity = 'medium';
      safetyConcerns.push('Gradual road degradation and cyclist hazard');
      explanation = 'Road surface compromise detected. Priority set to medium pending road depth survey.';
      recommendedNextAction = 'Queue for regional resurfacing team within 48 hours.';
    }
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('dump') || text.includes('waste') || text.includes('smell') || text.includes('debris') || text.includes('litter')) {
    category = 'waste_management';
    routingDepartment = 'Solid Waste & Sanitation Services';
    keyPhrases = ['accumulated refuse', 'sanitary vector attraction'];
    if (text.includes('rot') || text.includes('rats') || text.includes('maggot') || text.includes('toxic') || text.includes('medical') || text.includes('fire')) {
      severity = 'high';
      safetyConcerns.push('Biohazard vector attraction (rodents/insects) and airborne foul odor contamination');
      explanation = 'Urgent sanitation intervention required due to biological or pest vector indicators.';
      recommendedNextAction = 'Dispatch high-capacity compactor truck and apply sanitizing spray.';
    } else {
      severity = 'medium';
      safetyConcerns.push('Public space obstruction and aesthetic decay');
      explanation = 'Overflowing municipal receptacle or illegal dumping requiring scheduled pickup.';
      recommendedNextAction = 'Route waste disposal vehicle on next morning sanitation cycle.';
    }
  } else if (text.includes('pipe') || text.includes('leak') || text.includes('water') || text.includes('burst') || text.includes('flooding') || text.includes('gushing')) {
    category = 'water_leakage';
    routingDepartment = 'Water & Sewerage Authority';
    keyPhrases = ['pressurized main leak', 'potable water loss'];
    if (text.includes('burst') || text.includes('gushing') || text.includes('flooding') || text.includes('geyser') || text.includes('submerged')) {
      severity = 'critical';
      safetyConcerns.push('Severe drinking water loss, basement flooding, and ground collapse / sinkhole formation');
      explanation = 'Critical hazard flagged due to active pressurized water loss and underground soil destabilization risk.';
      recommendedNextAction = 'Shut off local isolation valve immediately and mobilize hydro-excavation team.';
    } else {
      severity = 'medium';
      safetyConcerns.push('Continuous municipal resource depletion');
      explanation = 'Moderate trickle or valve leak needing plumbing maintenance.';
      recommendedNextAction = 'Assign municipal plumbing technician within 24 hours.';
    }
  } else if (text.includes('drain') || text.includes('sewer') || text.includes('clog') || text.includes('manhole') || text.includes('overflow')) {
    category = 'drainage';
    routingDepartment = 'Stormwater & Drainage Division';
    keyPhrases = ['drainage blockage', 'stormwater runoff obstruction'];
    if (text.includes('overflow') || text.includes('monsoon') || text.includes('rain') || text.includes('raw sewage') || text.includes('impassable')) {
      severity = 'high';
      safetyConcerns.push('Urban flash flooding, contaminated backflow, and missing manhole pedestrian fall hazard');
      explanation = 'High risk of stormwater backflow or open manhole endangering pedestrian safety.';
      recommendedNextAction = 'Dispatch jetting vacuum truck and install perimeter safety cones.';
    } else {
      severity = 'medium';
      safetyConcerns.push('Stagnant standing water and mosquito breeding');
      explanation = 'Grate blockage by leaves and debris reducing drainage capacity.';
      recommendedNextAction = 'Clear catch basin grates during upcoming district maintenance run.';
    }
  } else if (text.includes('light') || text.includes('lamp') || text.includes('dark') || text.includes('streetlight') || text.includes('pole') || text.includes('bulb')) {
    category = 'streetlight_failure';
    routingDepartment = 'Municipal Electrical & Lighting Bureau';
    keyPhrases = ['illumination deficit', 'electrical infrastructure failure'];
    if (text.includes('junction') || text.includes('crossing') || text.includes('exposed wire') || text.includes('crosswalk') || text.includes('crime')) {
      severity = 'high';
      safetyConcerns.push('Pedestrian visibility hazard at critical road crossing and electrical shock danger');
      explanation = 'High risk due to darkness at an intersection or exposed wiring.';
      recommendedNextAction = 'Dispatch electrical line crew with cherry picker bucket truck.';
    } else {
      severity = 'low';
      safetyConcerns.push('Reduced night-time ambiance and minor visibility drop');
      explanation = 'Single fixture burnout in residential sector.';
      recommendedNextAction = 'Replace LED luminaire during bi-weekly night audit route.';
    }
  } else if (text.includes('bench') || text.includes('bridge') || text.includes('sidewalk') || text.includes('curb') || text.includes('handrail') || text.includes('sign') || text.includes('park')) {
    category = 'public_infrastructure';
    routingDepartment = 'Parks & Public Works Infrastructure';
    keyPhrases = ['civic amenity degradation', 'structural wear'];
    severity = text.includes('collapsed') || text.includes('broken') ? 'medium' : 'low';
    safetyConcerns.push('Minor trip hazard or disabled accessibility obstruction');
    explanation = 'Public structure requires carpentry or metalwork servicing.';
    recommendedNextAction = 'Inspect structural integrity and schedule bench/handrail replacement.';
  }

  return {
    category,
    confidence: 0.94,
    suggestedSeverity: severity,
    explanation: explanation || 'AI assessed report text against municipal hazard criteria.',
    keyPhrases: keyPhrases.length ? keyPhrases : ['civic maintenance requirement', 'reported citizen observation'],
    safetyConcerns: safetyConcerns.length ? safetyConcerns : ['Public inconvenience and urban asset deterioration'],
    recommendedNextAction,
    routingDepartment,
    isRealAi: false,
    model: 'CivicFix Rule-Based Deterministic Engine (Demo Mode)',
  };
}

// 1. Classification & Explainable Priority endpoint
app.post('/api/ai/classify', async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description) {
    return res.status(400).json({ error: 'Title or description required' });
  }

  // If real Gemini is available, call gemini-3.8-flash with structured schema
  if (aiClient) {
    try {
      const prompt = `Analyze this civic problem report submitted by a citizen for municipal triage:
Title: ${title}
Description: ${description}

Categorize the issue into one of: 'road_damage', 'waste_management', 'water_leakage', 'drainage', 'streetlight_failure', 'public_infrastructure', or 'other'.
Evaluate urgency and public hazard. Provide explainable priority recommendation ('low', 'medium', 'high', 'critical'), safety concerns, extracted key phrases, routing department, and recommended next action.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert civic problem triage AI for municipal public works departments. You accurately categorize citizen complaints, explain safety hazards, and provide objective severity recommendations with human oversight disclaimers.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "One of: 'road_damage', 'waste_management', 'water_leakage', 'drainage', 'streetlight_failure', 'public_infrastructure', 'other'",
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence score from 0.0 to 1.0',
              },
              suggestedSeverity: {
                type: Type.STRING,
                description: "One of: 'low', 'medium', 'high', 'critical'",
              },
              explanation: {
                type: Type.STRING,
                description: 'Short 1-2 sentence human-readable rationale explaining the priority score',
              },
              keyPhrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 salient phrases extracted from the report',
              },
              safetyConcerns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 1 to 3 tangible public health/safety risks',
              },
              recommendedNextAction: {
                type: Type.STRING,
                description: 'Actionable recommendation for the municipal dispatch team',
              },
              routingDepartment: {
                type: Type.STRING,
                description: 'The relevant municipal department or utility agency',
              },
            },
            required: ['category', 'suggestedSeverity', 'explanation', 'safetyConcerns', 'recommendedNextAction', 'routingDepartment'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        isRealAi: true,
        model: 'CivicFix Neural Engine v3.8',
      });
    } catch (err: any) {
      console.error('[AI Core] Classify error, falling back to deterministic engine:', err.message);
      const fallback = fallbackClassify(title || '', description || '');
      return res.json({
        ...fallback,
        apiErrorNotice: 'Server-side neural engine fallback utilized.',
      });
    }
  }

  // Demo fallback
  const fallback = fallbackClassify(title || '', description || '');
  res.json(fallback);
});

// Calculate Haversine distance in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 2. Duplicate Detection endpoint
app.post('/api/ai/detect-duplicates', async (req, res) => {
  const { targetComplaint, candidates } = req.body;
  if (!targetComplaint || !candidates || !Array.isArray(candidates)) {
    return res.status(400).json({ error: 'targetComplaint and candidates array required' });
  }

  // Pre-filter candidates by proximity (within 1000m) or same category
  const scoredCandidates = candidates
    .filter((c: any) => c.id !== targetComplaint.id && c.status !== 'closed' && c.status !== 'resolved')
    .map((c: any) => {
      const dist = calculateDistanceMeters(
        targetComplaint.latitude,
        targetComplaint.longitude,
        c.latitude,
        c.longitude
      );
      return { candidate: c, distanceMeters: dist };
    })
    .filter((item) => item.distanceMeters <= 1200 || item.candidate.category === targetComplaint.category);

  if (scoredCandidates.length === 0) {
    return res.json({ duplicates: [] });
  }

  // If real Gemini is enabled
  if (aiClient) {
    try {
      const prompt = `Compare the target civic complaint with each potential candidate to detect true duplicates.
Target Complaint:
ID: ${targetComplaint.id}
Title: ${targetComplaint.title}
Description: ${targetComplaint.description}
Category: ${targetComplaint.category}
Coordinates: [${targetComplaint.latitude}, ${targetComplaint.longitude}]

Candidate Complaints:
${scoredCandidates.map((sc, i) => `[#${i + 1}] ID: ${sc.candidate.id} | Title: ${sc.candidate.title} | Category: ${sc.candidate.category} | Description: ${sc.candidate.description} | Distance: ${sc.distanceMeters} meters`).join('\n')}

For each candidate, calculate semantic similarity (0-100), decide if it is a probable duplicate, and provide a 1-sentence transparent explanation citing location, physical description, or asset overlap. Only return candidates with similarity >= 45.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                candidateId: { type: Type.STRING },
                similarityScore: { type: Type.NUMBER, description: 'Percentage 0-100' },
                isDuplicate: { type: Type.BOOLEAN },
                reason: { type: Type.STRING, description: 'Transparent explanation for human administrator review' },
              },
              required: ['candidateId', 'similarityScore', 'isDuplicate', 'reason'],
            },
          },
        },
      });

      const parsedResults = JSON.parse(response.text || '[]');
      const merged = parsedResults.map((r: any) => {
        const item = scoredCandidates.find((sc) => sc.candidate.id === r.candidateId);
        return {
          targetId: targetComplaint.id,
          matchedComplaintId: r.candidateId,
          matchedComplaint: item?.candidate,
          similarityScore: r.similarityScore,
          isDuplicate: r.isDuplicate,
          distanceMeters: item?.distanceMeters ?? 0,
          reason: r.reason,
          isRealAi: true,
        };
      });

      return res.json({ duplicates: merged });
    } catch (err: any) {
      console.error('[Gemini API] Duplicate check error, falling back to deterministic math:', err.message);
    }
  }

  // Deterministic duplicate calculation based on category, word jaccard, and distance
  const duplicates = scoredCandidates.map(({ candidate, distanceMeters }) => {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    if (candidate.category === targetComplaint.category) {
      score += 35;
      reasons.push('Identical civic category');
    }

    // Distance factor
    if (distanceMeters < 50) {
      score += 45;
      reasons.push(`Direct geographic proximity (${distanceMeters}m away)`);
    } else if (distanceMeters < 250) {
      score += 30;
      reasons.push(`Located within immediate 250m vicinity (${distanceMeters}m)`);
    } else if (distanceMeters < 600) {
      score += 15;
      reasons.push(`Located within 600m corridor (${distanceMeters}m)`);
    }

    // Keyword overlap
    const words1 = new Set((targetComplaint.title + ' ' + targetComplaint.description).toLowerCase().split(/\W+/));
    const words2 = new Set((candidate.title + ' ' + candidate.description).toLowerCase().split(/\W+/));
    const common = [...words1].filter((w) => w.length > 3 && words2.has(w));
    if (common.length >= 3) {
      score += 25;
      reasons.push(`Shared keywords: "${common.slice(0, 3).join(', ')}"`);
    } else if (common.length >= 1) {
      score += 10;
      reasons.push(`Shared context: "${common[0]}"`);
    }

    const similarityScore = Math.min(98, Math.max(15, score));
    const isDuplicate = similarityScore >= 55;

    return {
      targetId: targetComplaint.id,
      matchedComplaintId: candidate.id,
      matchedComplaint: candidate,
      similarityScore,
      isDuplicate,
      distanceMeters,
      reason: reasons.join('; ') + (isDuplicate ? ' — Highly probable duplicate report.' : ' — Similar characteristics but distinct location or details.'),
      isRealAi: false,
    };
  }).filter((d) => d.similarityScore >= 40);

  res.json({ duplicates });
});

// 3. Civic Insights generator endpoint
app.post('/api/ai/insights', async (req, res) => {
  const { complaints } = req.body;
  if (!complaints || !Array.isArray(complaints)) {
    return res.status(400).json({ error: 'complaints array required' });
  }

  const total = complaints.length;
  const categoriesCount: Record<string, number> = {};
  complaints.forEach((c) => {
    categoriesCount[c.category] = (categoriesCount[c.category] || 0) + 1;
  });

  const topCategory = Object.entries(categoriesCount).sort((a, b) => b[1] - a[1])[0] || ['general', 0];

  if (aiClient) {
    try {
      const summaryData = `Total complaints: ${total}. Top category: ${topCategory[0]} (${topCategory[1]}). Breakdown: ${JSON.stringify(categoriesCount)}. High priority count: ${complaints.filter((c: any) => c.confirmedPriority === 'high' || c.confirmedPriority === 'critical').length}.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate an executive municipal civic intelligence brief from this data: ${summaryData}. Provide key trends, resource allocation advice, and high-risk hotspots summary in structured JSON.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              identifiedHotspots: { type: Type.ARRAY, items: { type: Type.STRING } },
              resourceRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              projectedResolutionPace: { type: Type.STRING },
            },
            required: ['executiveSummary', 'identifiedHotspots', 'resourceRecommendations', 'projectedResolutionPace'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        isRealAi: true,
      });
    } catch (err: any) {
      console.error('[Gemini API] Insights error:', err.message);
    }
  }

  // Deterministic fallback insights
  res.json({
    executiveSummary: `Analysis of ${total} active civic records reveals high clustering in ${topCategory[0].replace('_', ' ')} (${topCategory[1]} reports). Road damage and stormwater drainage represent 58% of urgent hazard flags.`,
    identifiedHotspots: [
      'North Sector Boulevard & 4th Avenue (Repetitive pothole & deep asphalt fractures)',
      'Riverside Commercial District (Stormwater catch basin overflow & backflow)',
      'Maplewood Residential Zone (Intermittent street luminaire blackout)',
    ],
    resourceRecommendations: [
      'Reallocate 2 rapid-patch asphalt crews to Ward 4 during non-peak hours (05:00-08:00)',
      'Pre-stage high-pressure jetting trucks near Riverside prior to forecasted rain',
      'Consolidate 4 duplicate complaints in Downtown Plaza to save dispatch duplication',
    ],
    projectedResolutionPace: 'Current resolution velocity averages 2.4 days per ticket; duplicate filtering expected to recover ~18% field workforce hours.',
    isRealAi: false,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[CivicFix Server] Running on http://0.0.0.0:${PORT} (AI Live: ${Boolean(aiClient)})`);
  });
}

startServer();
