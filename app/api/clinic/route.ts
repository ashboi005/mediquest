import { NextResponse } from "next/server";
import { groq, MODEL } from "@/lib/groq";

// List of disorders to randomly select from for variety
const DISORDERS = [
  "Down Syndrome", "Turner Syndrome", "Klinefelter Syndrome", "Marfan Syndrome",
  "Cystic Fibrosis", "Huntington's Disease", "Sickle Cell Disease", "Hemophilia A",
  "Duchenne Muscular Dystrophy", "Fragile X Syndrome", "Prader-Willi Syndrome",
  "Angelman Syndrome", "Williams Syndrome", "DiGeorge Syndrome", "Neurofibromatosis Type 1",
  "Phenylketonuria", "Tay-Sachs Disease", "Achondroplasia", "Osteogenesis Imperfecta",
  "Ehlers-Danlos Syndrome", "Rett Syndrome", "Gaucher Disease", "Fabry Disease",
  "Pompe Disease", "Thalassemia Major", "G6PD Deficiency", "Wilson Disease",
  "Hemochromatosis", "Alpha-1 Antitrypsin Deficiency", "Familial Hypercholesterolemia"
];

export async function POST() {
  try {
    // Pick a random disorder to ensure variety
    const targetDisorder = DISORDERS[Math.floor(Math.random() * DISORDERS.length)];
    
    const systemPrompt = `You are a medical case generator for clinical genetics education. Generate a realistic patient case for: ${targetDisorder}

Your response MUST be in this exact JSON format:
{
  "patient_story": "A detailed patient presentation with ONLY: age, sex, chief complaint, symptoms the patient describes, relevant personal history, and family history hints. DO NOT include any test results, lab values, or investigation findings in this section - only what the patient tells you and their observable symptoms.",
  "hidden_investigations": {
    "complete_blood_count": "CBC results if relevant, or 'Not particularly informative for this case'",
    "metabolic_panel": "Basic metabolic panel results if relevant",
    "hormone_panel": "Hormone levels if relevant (FSH, LH, TSH, etc.)",
    "lipid_panel": "Lipid profile if relevant",
    "genetic_testing": "Specific genetic test results (gene mutations, deletions, etc.)",
    "karyotype": "Karyotype analysis results",
    "enzyme_assay": "Enzyme activity levels if relevant for metabolic disorders",
    "imaging": "X-ray, MRI, Echo, or other imaging findings if relevant",
    "physical_exam": "Detailed physical examination findings including measurements, dysmorphic features, and clinical signs",
    "specialized_tests": "Any other specialized tests relevant to this condition"
  },
  "diagnosis_options": ["${targetDisorder}", "Plausible Wrong Option 1", "Plausible Wrong Option 2", "Plausible Wrong Option 3"],
  "correct_answer": "${targetDisorder}",
  "debrief": "A comprehensive explanation in plain text (no markdown). Include: why this is the correct diagnosis, key clinical features, genetic basis, inheritance pattern, why other options are incorrect, and management considerations.",
  "budget_hint": 500
}

CRITICAL RULES:
1. The patient_story must contain ZERO test results or lab values - only symptoms and history
2. Make investigations realistic - not all will be helpful for every case
3. The 4 diagnosis options should all be plausible genetic disorders
4. Vary the wrong options - don't always use the same alternatives
5. Use plain text only in debrief - no markdown formatting

Only respond with valid JSON, no additional text.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a new patient case for clinical genetics practice." },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (
          parsed.patient_story &&
          parsed.hidden_investigations &&
          parsed.diagnosis_options &&
          parsed.correct_answer &&
          parsed.debrief
        ) {
          // Shuffle diagnosis options but keep track of correct answer
          const shuffledOptions = [...parsed.diagnosis_options].sort(() => Math.random() - 0.5);
          
          return NextResponse.json({
            patient_story: parsed.patient_story,
            hidden_investigations: parsed.hidden_investigations,
            diagnosis_options: shuffledOptions,
            correct_answer: parsed.correct_answer,
            debrief: parsed.debrief,
            budget: parsed.budget_hint || 500,
          });
        }
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
    }

    // Fallback case if generation fails
    return NextResponse.json({
      patient_story: "A 16-year-old female presents to the clinic with concerns about short stature and delayed puberty. She is the shortest in her class and has not yet started menstruating. Her parents report she had frequent ear infections as a child and has always been a slow learner, though she performs adequately in school with extra support. On questioning, she mentions occasional swelling in her hands and feet, especially in the morning. Family history reveals her mother had normal puberty and her father is of average height.",
      hidden_investigations: {
        complete_blood_count: "WBC: 6.5, RBC: 4.2, Hgb: 12.8, Platelets: 245 - Within normal limits",
        metabolic_panel: "All values within normal limits",
        hormone_panel: "FSH: 45 mIU/mL (elevated), LH: 32 mIU/mL (elevated), Estradiol: <20 pg/mL (low), TSH: 2.5 (normal)",
        lipid_panel: "Total cholesterol: 180, LDL: 110, HDL: 55, Triglycerides: 90 - Within normal limits",
        genetic_testing: "FISH analysis positive for monosomy X",
        karyotype: "45,X karyotype confirmed. No Y chromosome material detected.",
        enzyme_assay: "Not indicated for this presentation",
        imaging: "Echocardiogram: Bicuspid aortic valve noted. Renal ultrasound: Horseshoe kidney.",
        physical_exam: "Height: 4'8\" (below 3rd percentile). Webbed neck. Low posterior hairline. Shield chest with widely spaced nipples. Cubitus valgus. No breast development (Tanner stage 1). Lymphedema of hands and feet. BP: 130/85 mmHg.",
        specialized_tests: "Bone age: Delayed by 2 years. Hearing test: Mild sensorineural hearing loss.",
      },
      diagnosis_options: [
        "Turner Syndrome",
        "Noonan Syndrome",
        "Constitutional Growth Delay",
        "Growth Hormone Deficiency",
      ],
      correct_answer: "Turner Syndrome",
      debrief: "This is Turner Syndrome (45,X), a chromosomal disorder affecting females characterized by complete or partial absence of one X chromosome.\n\nKey diagnostic features in this case:\n- Short stature (cardinal feature)\n- Primary amenorrhea with hypergonadotropic hypogonadism (elevated FSH/LH, low estradiol)\n- Classic physical features: webbed neck, low hairline, shield chest, cubitus valgus\n- Lymphedema (especially in infancy/childhood)\n- 45,X karyotype confirmation\n\nWhy other options are incorrect:\n- Noonan Syndrome: Similar features but has normal karyotype, affects both sexes, and typically has pulmonary stenosis\n- Constitutional Growth Delay: Would have normal karyotype and eventual spontaneous puberty\n- Growth Hormone Deficiency: Would not explain the hypergonadotropic hypogonadism or dysmorphic features\n\nManagement includes growth hormone therapy, estrogen replacement for puberty induction, and monitoring for associated conditions (cardiac anomalies, renal abnormalities, hypothyroidism, hearing loss).",
      budget: 500,
    });
  } catch (error) {
    console.error("Clinic API error:", error);
    return NextResponse.json(
      { error: "Failed to generate case" },
      { status: 500 }
    );
  }
}
