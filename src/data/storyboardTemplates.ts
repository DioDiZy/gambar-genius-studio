export interface StoryFrame {
  frame_id: number;
  title_id: string;
  instruction_id: string;
  english_prompt: string;
}

export interface StoryboardTemplate {
  id: string;
  template_name: string;
  target_audience: string;
  global_visual_style: string;
  character_consistency_rules: string;
  story_frames: StoryFrame[];
}

export const storyboardTemplates: StoryboardTemplate[] = [
  {
    id: "petualangan-dongeng-ajaib",
    template_name: "Petualangan Dongeng Ajaib",
    target_audience: "SD Kelas 5-6",
    global_visual_style:
      "High-quality 3D digital illustration, Pixar and Disney animation style, vibrant colors, soft cinematic lighting, 8k resolution, whimsical atmosphere, clean lines, consistent character design.",
    character_consistency_rules:
      "Maintain the same facial features, hair color, and outfit across all frames. Use the specific character description provided by the user as the primary anchor.",
    story_frames: [
      {
        frame_id: 1,
        title_id: "Awal Mula",
        instruction_id:
          "Gambarkan karakter sedang berada di lingkungan rumah atau desa yang damai.",
        english_prompt:
          "A storyboard panel of [USER_CHARACTER_DESCRIPTION], [USER_CHARACTER_EXPRESSION: happy], standing in a lush green fairytale village, whimsical cottages in background, [GLOBAL_STYLE]. The character is wearing [USER_CHARACTER_OUTFIT]. Focus on clear facial features and consistent lighting.",
      },
      {
        frame_id: 2,
        title_id: "Menemukan Masalah",
        instruction_id:
          "Gambarkan karakter menemukan sesuatu yang ajaib di dalam hutan.",
        english_prompt:
          "A storyboard panel of [USER_CHARACTER_DESCRIPTION], [USER_CHARACTER_EXPRESSION: surprised], inside a glowing enchanted forest, giant mushrooms and sparkling dust, [GLOBAL_STYLE]. Same outfit and physical features as frame 1. High contrast between the character and the magical background.",
      },
      {
        frame_id: 3,
        title_id: "Puncak Cerita",
        instruction_id:
          "Gambarkan karakter sedang beraksi atau memecahkan teka-teki.",
        english_prompt:
          "A storyboard panel of [USER_CHARACTER_DESCRIPTION], [USER_CHARACTER_EXPRESSION: determined], casting a golden magic spell or holding a glowing artifact, dramatic lighting, intense colors, [GLOBAL_STYLE]. Ensure character consistency in face and clothing remains identical to previous panels.",
      },
      {
        frame_id: 4,
        title_id: "Akhir Bahagia",
        instruction_id:
          "Gambarkan karakter kembali dengan rasa bangga.",
        english_prompt:
          "A storyboard panel of [USER_CHARACTER_DESCRIPTION], [USER_CHARACTER_EXPRESSION: joyful and proud], standing under a sunset sky, hero pose, [GLOBAL_STYLE]. Soft warm lighting, consistent character appearance, cinematic ending shot.",
      },
    ],
  },
];

export function buildPromptsFromTemplate(
  template: StoryboardTemplate,
  characterDescription: string,
  characterOutfit: string
): { prompts: string[]; frameTitles: string[] } {
  const prompts = template.story_frames.map((frame) => {
    let prompt = frame.english_prompt;
    prompt = prompt.replace(/\[USER_CHARACTER_DESCRIPTION\]/g, characterDescription);
    prompt = prompt.replace(/\[USER_CHARACTER_OUTFIT\]/g, characterOutfit);
    prompt = prompt.replace(/\[GLOBAL_STYLE\]/g, template.global_visual_style);
    // Remove expression placeholders but keep the expression text
    prompt = prompt.replace(/\[USER_CHARACTER_EXPRESSION:\s*([^\]]+)\]/g, "with a $1 expression");
    return prompt;
  });

  const frameTitles = template.story_frames.map((f) => f.title_id);

  return { prompts, frameTitles };
}
