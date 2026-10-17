import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// កំណត់រយៈពេលអតិបរមានៃមុខងារ (វីដេអូអាចត្រូវការពេលយូរ)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video');
    const targetLang = formData.get('targetLang') || 'Khmer';

    if (!videoFile) {
      return NextResponse.json({ error: 'រកមិនឃើញឯកសារវីដេអូ' }, { status: 400 });
    }

    // បំប្លែងឯកសារទៅជា base64 សម្រាប់ Gemini ប្រើប្រាស់
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // ប្រើ gemini-3.8-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    const prompt = `
អ្នកគឺជាអ្នកជំនាញបកប្រែវីដេអូ។
1. សូមទាញយកខ្លឹមសារសំខាន់ៗ ឬអត្ថបទសន្ទនាពីវីដេអូនេះ (ជាភាសាដើម)។ ប្រសិនបើមានអក្សររត់ សូមយោងតាមអក្សររត់។
2. បកប្រែខ្លឹមសារទៅជា ${targetLang}។
3. បង្ហាញលទ្ធផលជាទម្រង់ JSON៖ {"transcript": "អត្ថបទដើម", "translation": "អត្ថបទបកប្រែ"}។
ប្រសិនបើមិនអាចទាញយកសំឡេងបាន សូមព្យាយាមពិពណ៌នាខ្លឹមសារវីដេអូ។
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: videoFile.type || 'video/mp4',
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text();

    // ព្យាយាមញែក JSON ចេញពីការត្រឡប់មកវិញរបស់ AI
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // ប្រសិនបើញែកមិនបាន ត្រឡប់អត្ថបទដើមដោយផ្ទាល់
      parsed = { transcript: responseText, translation: responseText };
    }

    return NextResponse.json({
      transcript: parsed.transcript || '',
      translation: parsed.translation || '',
    });
  } catch (error) {
    console.error('កំហុស API៖', error);
    return NextResponse.json(
      { error: 'ការដំណើរការបរាជ័យ៖ ' + error.message },
      { status: 500 }
    );
  }
}
