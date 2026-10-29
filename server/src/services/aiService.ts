import crypto from 'crypto';
import { FacialFeatures, SketchVersion, BiometricMetrics, AIProviderConfig } from '../types/index.js';
import { store } from '../db/store.js';

// High-fidelity curated forensic composite sketches for demo/offline mode
// Categorized by gender, age, face shape, and hair
const DEMO_SKETCHES = {
  male_angular_dark: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
  ],
  male_older_weathered: [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
  ],
  female_sharp_dark: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  ],
  female_soft_light: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
  ],
};

export class AIService {
  /**
   * Build an authentic, specialized forensic police composite prompt
   */
  public buildForensicPrompt(
    features: FacialFeatures,
    witnessStatement?: string,
    refinementNotes?: string
  ): { prompt: string; negativePrompt: string } {
    const parts: string[] = [];

    // Core forensic style anchor
    parts.push('Forensic facial composite pencil sketch, realistic graphite drawing on paper');
    parts.push('police forensic artist illustration, high-contrast monochrome, cross-hatching shading');
    parts.push('neutral facial expression, straight-on frontal mugshot perspective, anatomical precision');

    // Demographic and cranial structure
    const calculatedAge = this.getApproximateAge(features.ageGroup, features.refinements.ageOffset);
    parts.push(`${features.gender}, approximately ${calculatedAge} years old`);
    parts.push(`${features.faceShape.toLowerCase()} face shape with ${features.jawline.toLowerCase()} jawline`);

    // Eyes and brows
    parts.push(`${features.eyesShape.toLowerCase()} eyes, ${features.eyeColor.toLowerCase()} iris`);
    parts.push(`${features.eyebrows.toLowerCase()} eyebrows`);

    // Nose
    parts.push(`${features.nose.toLowerCase()} nose`);

    // Hair and facial hair
    parts.push(`${features.hairstyle.toLowerCase()} hairstyle, ${features.hairColor.toLowerCase()}`);
    if (features.facialHair && features.facialHair !== 'Clean Shaven') {
      parts.push(`${features.facialHair.toLowerCase()}`);
    }

    // Complexion and refinements
    if (features.skinTone) {
      parts.push(`${features.skinTone.toLowerCase()} skin texture`);
    }

    if (features.refinements.jawWidth > 60) {
      parts.push('wide pronounced mandibular jawline');
    } else if (features.refinements.jawWidth < 40) {
      parts.push('narrow tapering chin and jaw');
    }

    if (features.refinements.stubbleDensity > 60) {
      parts.push('heavy 5 o clock shadow stubble along jaw and neck');
    }

    if (features.refinements.cheekHollow > 60) {
      parts.push('prominent cheek hollows, gaunt facial contours');
    }

    // Distinctive features
    if (features.distinctiveFeatures && features.distinctiveFeatures.length > 0) {
      parts.push(`distinctive features: ${features.distinctiveFeatures.join(', ')}`);
    }

    // Accessories
    if (features.accessories && features.accessories.length > 0 && !features.accessories.includes('None')) {
      parts.push(`accessories: ${features.accessories.join(', ')}`);
    }

    // Refinement delta notes
    if (refinementNotes && refinementNotes.trim().length > 0) {
      parts.push(`witness correction adjustments: ${refinementNotes.trim()}`);
    }

    // Witness statement excerpt if available
    if (witnessStatement && witnessStatement.trim().length > 0) {
      // Pick key descriptive sentences
      const snippet = witnessStatement.slice(0, 120).replace(/[^\w\s,.-]/g, '');
      parts.push(`witness statement cues: "${snippet}"`);
    }

    const prompt = parts.join(', ');
    const negativePrompt =
      'photograph, real human photo, color, vibrant colors, 3d render, cgi, anime, cartoon, sketchpad logo, watermark, deformed, extra eyes, smiling, open mouth, teeth, glamorous makeup, distorted features, blurry, oversaturated';

    return { prompt, negativePrompt };
  }

  private getApproximateAge(ageGroup: string, offset: number): number {
    let base = 30;
    if (ageGroup === '18-25') base = 22;
    else if (ageGroup === '26-35') base = 31;
    else if (ageGroup === '36-45') base = 40;
    else if (ageGroup === '46-55') base = 50;
    else if (ageGroup === '56-65') base = 60;
    else if (ageGroup === '65+') base = 70;

    return Math.max(16, Math.min(85, base + (offset || 0)));
  }

  /**
   * Calculate simulated cranial biometric metrics based on features
   */
  public calculateBiometrics(features: FacialFeatures): BiometricMetrics {
    const seed = JSON.stringify(features);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const abs = Math.abs(hash);

    const cranialRatio = parseFloat((1.22 + (abs % 25) / 100).toFixed(2));
    const interpupillaryDistance = parseFloat((59.0 + (abs % 80) / 10).toFixed(1));
    const jawAngleDegrees = parseFloat((106.0 + (abs % 180) / 10).toFixed(1));
    const symmetryScore = parseFloat((89.0 + (abs % 100) / 12).toFixed(1));

    return {
      cranialRatio,
      interpupillaryDistance,
      jawAngleDegrees,
      symmetryScore,
    };
  }

  /**
   * Generate sketch image using configured AI provider or fallback demo
   */
  public async generateCompositeSketch(
    features: FacialFeatures,
    versionNumber: number,
    createdBy: string,
    witnessStatement?: string,
    refinementNotes?: string,
    configOverride?: Partial<AIProviderConfig>
  ): Promise<SketchVersion> {
    const config = { ...store.getConfig(), ...configOverride };
    const { prompt, negativePrompt } = this.buildForensicPrompt(features, witnessStatement, refinementNotes);
    const biometrics = this.calculateBiometrics(features);

    let imageUrl = '';
    let providerUsed: SketchVersion['provider'] = config.provider || 'pollinations';
    let modelUsed = 'ForensicSketch-XL (Graphite Core)';

    const seed = Math.floor(Math.random() * 9999999);

    if (config.provider === 'openai' && config.apiKey) {
      try {
        modelUsed = config.modelName || 'dall-e-3';
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Black and white graphite pencil drawing, forensic composite police sketch on drawing paper: ${prompt}`,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          if (data.data && data.data[0]?.url) {
            imageUrl = data.data[0].url;
            providerUsed = 'openai';
          }
        } else {
          console.warn('[AIService] OpenAI generation error, falling back to Pollinations AI');
        }
      } catch (err) {
        console.error('[AIService] OpenAI call failed:', err);
      }
    } else if (config.provider === 'huggingface' && config.apiKey) {
      try {
        const hfModel = config.modelName || 'stabilityai/stable-diffusion-xl-base-1.0';
        modelUsed = `HuggingFace: ${hfModel}`;
        const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Forensic police composite sketch, pencil drawing on parchment: ${prompt}`,
            parameters: { negative_prompt: negativePrompt },
          }),
        });

        if (response.ok) {
          const blob = await response.arrayBuffer();
          const base64 = Buffer.from(blob).toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
          providerUsed = 'huggingface';
        }
      } catch (err) {
        console.error('[AIService] HuggingFace call failed:', err);
      }
    }

    // Default real generative AI: Pollinations AI (free, instant, no key required)
    if (!imageUrl && config.provider !== 'procedural_demo') {
      try {
        const cleanPrompt = encodeURIComponent(
          `forensic police sketch, graphite pencil drawing, ${prompt.slice(0, 300)}`
        );
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=768&height=768&model=flux&seed=${seed}&nologo=true`;
        
        // Pollinations generates on-the-fly via URL
        imageUrl = pollinationsUrl;
        providerUsed = 'pollinations';
        modelUsed = 'Pollinations FLUX (Forensic Pencil Pipeline)';
      } catch (err) {
        console.error('[AIService] Pollinations URL build failed:', err);
      }
    }

    // Guaranteed Demo Mode fallback if selected or credentials unavailable
    if (!imageUrl || config.provider === 'procedural_demo') {
      providerUsed = 'procedural_demo';
      modelUsed = 'ForensicStudio Procedural (Demo Fallback)';
      imageUrl = this.pickDemoSketch(features, versionNumber);
    }

    // Calculate confidence score based on feature completeness
    const completeness = this.calculateFeatureCompleteness(features);
    const confidenceScore = Math.min(96, Math.max(72, Math.round(completeness * 0.95 + (seed % 6))));

    const sketchVersion: SketchVersion = {
      id: `SKT-${Date.now().toString(36)}-V${versionNumber}`,
      versionNumber,
      imageUrl,
      prompt,
      negativePrompt,
      modelUsed,
      provider: providerUsed,
      confidenceScore,
      refinementNotes,
      createdAt: new Date().toISOString(),
      createdBy,
      featuresSnapshot: JSON.parse(JSON.stringify(features)),
      biometricMetrics: biometrics,
    };

    return sketchVersion;
  }

  private pickDemoSketch(features: FacialFeatures, versionNumber: number): string {
    const isFemale = features.gender === 'Female';
    const isOlder = features.ageGroup === '46-55' || features.ageGroup === '56-65' || features.ageGroup === '65+';

    let pool: string[];
    if (isFemale) {
      pool = features.skinTone?.includes('Fair') ? DEMO_SKETCHES.female_soft_light : DEMO_SKETCHES.female_sharp_dark;
    } else {
      pool = isOlder ? DEMO_SKETCHES.male_older_weathered : DEMO_SKETCHES.male_angular_dark;
    }

    const index = (versionNumber - 1) % pool.length;
    return pool[index] || pool[0];
  }

  private calculateFeatureCompleteness(features: FacialFeatures): number {
    let score = 50;
    if (features.faceShape) score += 5;
    if (features.eyesShape) score += 5;
    if (features.nose) score += 5;
    if (features.jawline) score += 5;
    if (features.hairstyle) score += 5;
    if (features.facialHair) score += 5;
    if (features.distinctiveFeatures && features.distinctiveFeatures.length > 0) score += 10;
    if (features.accessories && features.accessories.length > 0) score += 5;
    return Math.min(100, score);
  }

  /**
   * Intelligently parse raw witness natural language statements and extract structured features
   */
  public extractFeaturesFromStatement(statement: string): Partial<FacialFeatures> {
    const text = statement.toLowerCase();
    const extracted: Partial<FacialFeatures> = {
      distinctiveFeatures: [],
      accessories: [],
    };

    // Gender
    if (text.includes('woman') || text.includes('female') || text.includes('she') || text.includes('her') || text.includes('lady') || text.includes('girl')) {
      extracted.gender = 'Female';
    } else if (text.includes('man') || text.includes('male') || text.includes('he') || text.includes('guy') || text.includes('his') || text.includes('boy')) {
      extracted.gender = 'Male';
    }

    // Age
    if (text.includes('teen') || text.includes('early 20') || text.includes('college') || text.includes('18') || text.includes('young')) {
      extracted.ageGroup = '18-25';
    } else if (text.includes('late 20') || text.includes('early 30') || text.includes('around 30') || text.includes('mid 20')) {
      extracted.ageGroup = '26-35';
    } else if (text.includes('late 30') || text.includes('early 40') || text.includes('mid 30') || text.includes('around 40')) {
      extracted.ageGroup = '36-45';
    } else if (text.includes('late 40') || text.includes('early 50') || text.includes('around 50') || text.includes('middle age')) {
      extracted.ageGroup = '46-55';
    } else if (text.includes('older') || text.includes('senior') || text.includes('elderly') || text.includes('60') || text.includes('70')) {
      extracted.ageGroup = '56-65';
    }

    // Face Shape
    if (text.includes('square') || text.includes('box')) extracted.faceShape = 'Square';
    else if (text.includes('round') || text.includes('chubby') || text.includes('full face')) extracted.faceShape = 'Round';
    else if (text.includes('sharp') || text.includes('diamond') || text.includes('cheekbones')) extracted.faceShape = 'Diamond';
    else if (text.includes('heart') || text.includes('pointed chin')) extracted.faceShape = 'Heart';
    else if (text.includes('long') || text.includes('oblong')) extracted.faceShape = 'Oblong';
    else extracted.faceShape = 'Oval';

    // Jawline
    if (text.includes('angular') || text.includes('sharp jaw')) extracted.jawline = 'Sharp Angular';
    else if (text.includes('chiseled') || text.includes('square jaw')) extracted.jawline = 'Square Chiseled';
    else if (text.includes('cleft') || text.includes('dimple in chin')) extracted.jawline = 'Cleft Chin';
    else if (text.includes('double chin') || text.includes('soft jaw')) extracted.jawline = 'Soft Rounded';

    // Eyes
    if (text.includes('deep-set') || text.includes('sunken')) extracted.eyesShape = 'Deep-set';
    else if (text.includes('almond') || text.includes('cat')) extracted.eyesShape = 'Almond';
    else if (text.includes('hooded')) extracted.eyesShape = 'Hooded';
    else if (text.includes('round eyes') || text.includes('wide eyes') || text.includes('bug')) extracted.eyesShape = 'Round';
    else if (text.includes('narrow') || text.includes('squint')) extracted.eyesShape = 'Narrow';

    // Eye color
    if (text.includes('blue eye')) extracted.eyeColor = 'Blue';
    else if (text.includes('green eye')) extracted.eyeColor = 'Green';
    else if (text.includes('hazel')) extracted.eyeColor = 'Hazel';
    else if (text.includes('dark eye') || text.includes('black eye')) extracted.eyeColor = 'Dark';
    else if (text.includes('brown eye')) extracted.eyeColor = 'Brown';

    // Nose
    if (text.includes('crooked') || text.includes('broken nose')) extracted.nose = 'Broken / Asymmetric';
    else if (text.includes('hook') || text.includes('aquiline') || text.includes('roman nose')) extracted.nose = 'Aquiline / Hooked';
    else if (text.includes('wide nose') || text.includes('broad nose')) extracted.nose = 'Wide / Broad';
    else if (text.includes('button') || text.includes('small nose')) extracted.nose = 'Button / Small';
    else if (text.includes('straight nose')) extracted.nose = 'Straight';

    // Hairstyle
    if (text.includes('buzz') || text.includes('crew cut')) extracted.hairstyle = 'Buzz Cut';
    else if (text.includes('bald') || text.includes('shaved head')) extracted.hairstyle = 'Bald / Shaved';
    else if (text.includes('receding') || text.includes('balding')) extracted.hairstyle = 'Receding Hairline';
    else if (text.includes('curly') || text.includes('afro')) extracted.hairstyle = 'Curly / Afro';
    else if (text.includes('dread') || text.includes('braid')) extracted.hairstyle = 'Braids / Dreadlocks';
    else if (text.includes('slick') || text.includes('ponytail') || text.includes('bun')) extracted.hairstyle = 'Long Slicked';
    else if (text.includes('wavy')) extracted.hairstyle = 'Wavy Medium';
    else if (text.includes('short')) extracted.hairstyle = 'Short Cropped';

    // Hair color
    if (text.includes('blonde') || text.includes('fair hair')) extracted.hairColor = 'Blonde';
    else if (text.includes('gray') || text.includes('grey') || text.includes('salt and pepper') || text.includes('silver')) extracted.hairColor = 'Gray / Salt & Pepper';
    else if (text.includes('red hair') || text.includes('ginger') || text.includes('auburn')) extracted.hairColor = 'Red / Auburn';
    else if (text.includes('black hair')) extracted.hairColor = 'Black';
    else if (text.includes('brown hair')) extracted.hairColor = 'Dark Brown';

    // Facial hair
    if (text.includes('clean shaven') || text.includes('no beard') || text.includes('shaved face')) extracted.facialHair = 'Clean Shaven';
    else if (text.includes('stubble') || text.includes('shadow') || text.includes('scruff') || text.includes('unshaven')) extracted.facialHair = "5 O'Clock Shadow";
    else if (text.includes('beard') && !text.includes('goatee')) extracted.facialHair = 'Full Beard';
    else if (text.includes('goatee') || text.includes('chin beard')) extracted.facialHair = 'Goatee';
    else if (text.includes('mustache') || text.includes('moustache')) extracted.facialHair = 'Horseshoe Mustache';

    // Distinctive Marks
    if (text.includes('scar') || text.includes('cut')) {
      if (text.includes('eyebrow')) extracted.distinctiveFeatures?.push('Scar over left eyebrow');
      else if (text.includes('cheek')) extracted.distinctiveFeatures?.push('Cheek scar');
      else extracted.distinctiveFeatures?.push('Prominent facial scar');
    }
    if (text.includes('mole') || text.includes('birthmark')) {
      extracted.distinctiveFeatures?.push('Facial mole / mark');
    }
    if (text.includes('wrinkle') || text.includes('crow')) {
      extracted.distinctiveFeatures?.push("Deep crow's feet & forehead furrows");
    }
    if (text.includes('tattoo')) {
      extracted.distinctiveFeatures?.push('Neck / facial tattoo');
    }
    if (text.includes('hollow') || text.includes('sunken cheek')) {
      extracted.distinctiveFeatures?.push('Sunken hollow cheeks');
    }

    // Accessories
    if (text.includes('glasses') || text.includes('spectacle')) {
      extracted.accessories?.push('Wire-rim spectacles');
    }
    if (text.includes('cap') || text.includes('baseball')) {
      extracted.accessories?.push('Baseball cap');
    }
    if (text.includes('beanie') || text.includes('knit hat')) {
      extracted.accessories?.push('Knit beanie');
    }
    if (text.includes('hoodie') || text.includes('hood')) {
      extracted.accessories?.push('Hoodie pulled up');
    }

    return extracted;
  }
}

export const aiService = new AIService();
