import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

import { updateContributorProfile } from '@/lib/services/champions';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// Use the same model as gemini-data-fetcher
const GEMINI_MODEL = 'gemini-2.5-flash';

interface TreeAnalysisMatrix {
    treeName: string;
    treeQuantity: number;
    estimatedAge?: number;
    healthScore?: number;
    o2ProductionPerYear?: number;
    totalLifespanO2?: number;
    estimatedLifespan?: number;
    speciesConfidence?: 'high' | 'medium' | 'low';
    notes?: string;
}

/**
 * Analyze tree image and form data with Gemini AI
 */
async function analyzeTreeWithGemini(
    imageBuffer: Buffer,
    imageMimeType: string,
    formData: {
        treeName: string;
        treeQuantity: number;
        districtName: string;
        state: string;
    }
): Promise<TreeAnalysisMatrix | null> {
    if (!GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not configured');
        return null;
    }

    try {
        // Convert image to base64
        const base64Image = imageBuffer.toString('base64');

        const prompt = `Analyze this tree planting photo and provide an environmental impact matrix.

Form Data:
- Tree Name: ${formData.treeName}
- Quantity: ${formData.treeQuantity} trees
- Location: ${formData.districtName}, ${formData.state}, India

Task:
1. Identify the tree species from the image (verify against provided name: ${formData.treeName})
2. Estimate tree age/health if visible
3. Calculate O2 production potential:
   - Standard: ${ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR} kg O2/year per mature tree
   - Adjust based on species, age, and health if visible
   - Estimate lifespan (typically 30-100 years depending on species)
4. Calculate total O2 production over estimated lifespan

Return ONLY valid JSON in this exact format:
{
  "treeName": "<species name>",
  "treeQuantity": ${formData.treeQuantity},
  "estimatedAge": <number in years or null>,
  "healthScore": <0-100 or null>,
  "o2ProductionPerYear": <kg per tree per year>,
  "estimatedLifespan": <years>,
  "totalLifespanO2": <total kg O2 for all trees over lifespan>,
  "speciesConfidence": "high|medium|low",
  "notes": "<any relevant observations>"
}

Be factual and conservative in estimates. If image quality is poor, use standard values.`;

        // Try different model names if one fails
        let modelName = GEMINI_MODEL;
        let response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inline_data: {
                                    mime_type: imageMimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        // If 404, try gemini-pro as fallback
        if (!response.ok && response.status === 404) {
            modelName = 'gemini-1.5-pro';
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: prompt
                                },
                                {
                                    inline_data: {
                                        mime_type: imageMimeType,
                                        data: base64Image
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            temperature: 0.2,
                            topK: 1,
                            topP: 1,
                            maxOutputTokens: 1024,
                        },
                    }),
                }
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text;

        if (!text) {
            return null;
        }

        // Extract JSON from response (may have markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in Gemini response:', text);
            return null;
        }

        const matrix = JSON.parse(jsonMatch[0]) as TreeAnalysisMatrix;

        // Ensure required fields
        if (!matrix.treeName || !matrix.totalLifespanO2) {
            // Fallback calculation if Gemini didn't provide totalLifespanO2
            const standardO2PerYear = matrix.o2ProductionPerYear || 110;
            const standardLifespan = matrix.estimatedLifespan || 50;
            matrix.totalLifespanO2 = formData.treeQuantity * standardO2PerYear * standardLifespan;
        }

        return matrix;
    } catch (error) {
        console.error('Error analyzing tree with Gemini:', error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const districtId = formData.get('districtId') as string;
        const districtName = formData.get('districtName') as string;
        const state = formData.get('state') as string;
        const treeName = formData.get('treeName') as string;
        const treeQuantity = parseInt(formData.get('treeQuantity') as string) || 1;
        const userName = formData.get('userName') as string | null;
        const userEmail = formData.get('userEmail') as string | null;
        const image = formData.get('image') as File;
        const userId = formData.get('userId') as string | null;

        if (!districtId || !districtName || !state || !treeName || !image) {
            return NextResponse.json(
                { error: 'District, tree name, and image are required' },
                { status: 400 }
            );
        }

        // Verify district exists
        const districtRef = adminDb.collection('districts').doc(districtId);
        const districtSnap = await districtRef.get();
        if (!districtSnap.exists) {
            return NextResponse.json(
                { error: 'District not found' },
                { status: 404 }
            );
        }

        // Convert image to buffer
        const arrayBuffer = await image.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        // Analyze with Gemini AI
        let analysisMatrix = await analyzeTreeWithGemini(
            imageBuffer,
            image.type,
            {
                treeName,
                treeQuantity,
                districtName,
                state,
            }
        );

        // Species Reference Data (O2 in kg/year, Lifespan in years)
        const SPECIES_DATA = ENVIRONMENTAL_CONSTANTS.TREES.SPECIES_DATA;

        function getSpeciesEstimates(name: string) {
            const defaults = {
                o2: ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR,
                lifespan: ENVIRONMENTAL_CONSTANTS.TREES.DEFAULT_LIFESPAN_YEARS
            };

            if (!name) return defaults;
            const normalized = name.toLowerCase().trim();
            // Check partial matches (e.g. "Mango Tree" -> matches "mango")
            const match = Object.keys(SPECIES_DATA).find(species => normalized.includes(species));
            return match ? SPECIES_DATA[match] : defaults;
        }

        if (!analysisMatrix) {
            // Fallback: use species-specific estimates
            const estimates = getSpeciesEstimates(treeName);
            const standardO2PerYear = estimates.o2;
            const standardLifespan = estimates.lifespan;

            analysisMatrix = {
                treeName,
                treeQuantity,
                o2ProductionPerYear: standardO2PerYear,
                estimatedLifespan: standardLifespan,
                totalLifespanO2: treeQuantity * standardO2PerYear * standardLifespan,
                speciesConfidence: 'low',
                notes: 'Analysis unavailable. Estimates based on species data.',
            };
        }

        // Save only the evaluated matrix to Firestore (no image storage)
        try {
            const contribRef = adminDb.collection('tree_contributions').doc();

            // Build document data, excluding undefined values
            const docData: any = {
                districtId,
                districtName,
                state,
                treeName: analysisMatrix.treeName || treeName,
                treeQuantity: analysisMatrix.treeQuantity || treeQuantity,
                totalLifespanO2: analysisMatrix.totalLifespanO2,
                o2ProductionPerYear: analysisMatrix.o2ProductionPerYear || ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR,
                estimatedLifespan: analysisMatrix.estimatedLifespan || 50,
                speciesConfidence: analysisMatrix.speciesConfidence || 'medium',
                status: 'VERIFIED', // Auto-verified since analyzed by AI
                plantedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Only add optional fields if they have values
            if (analysisMatrix.estimatedAge !== undefined && analysisMatrix.estimatedAge !== null) {
                docData.estimatedAge = analysisMatrix.estimatedAge;
            }
            if (analysisMatrix.healthScore !== undefined && analysisMatrix.healthScore !== null) {
                docData.healthScore = analysisMatrix.healthScore;
            }
            if (analysisMatrix.notes) {
                docData.analysisNotes = analysisMatrix.notes;
            }
            if (userId) {
                docData.userId = userId;
            }
            if (userName) {
                docData.userName = userName;
            }
            if (userEmail) {
                docData.userEmail = userEmail;
            }
            // Capture contribution type ('plantation' or 'donation'), defaulting to 'plantation'
            const contributionType = formData.get('contributionType') as string || 'plantation';
            docData.type = contributionType;

            await contribRef.set(docData);

            // Update contributor profile (stats, badges, rankings)
            if (userId && userName) {
                try {
                    await updateContributorProfile(userId, userName, userEmail || undefined);
                } catch (err) {
                    console.error('Failed to update contributor profile:', err);
                    // Continue even if profile update fails to return success for the planting
                }
            }

            return NextResponse.json({
                message: 'Tree contribution analyzed and saved successfully',
                contributionId: contribRef.id,
                matrix: analysisMatrix,
            });
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            return NextResponse.json(
                { error: 'Failed to save contribution to database' },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Error submitting tree contribution:', error);
        const errorMessage = error?.message || 'Unknown error occurred';
        const errorStack = error?.stack || '';
        console.error('Error details:', { errorMessage, errorStack });
        return NextResponse.json(
            {
                error: 'Failed to submit contribution',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}

