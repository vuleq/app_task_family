/**
 * Translation mapping for task template titles
 * Maps Vietnamese titles to English titles
 */

export const templateTitleTranslations: Record<string, string> = {
  // Việc học
  'Làm xong bài tập về nhà': 'Complete homework',
  'Đọc sách 15 phút': 'Read for 15 minutes',
  'Đọc sách 30 phút': 'Read for 30 minutes',
  'Viết 1 đoạn văn ngắn (5–7 câu)': 'Write a short paragraph (5-7 sentences)',
  'Luyện toán 15 phút': 'Practice math for 15 minutes',
  'Luyện toán 30 phút': 'Practice math for 30 minutes',
  'Học từ vựng mới (5 từ)': 'Learn new vocabulary (5 words)',
  'Học từ vựng mới (10 từ)': 'Learn new vocabulary (10 words)',
  'Xem video học tập & tóm tắt': 'Watch educational video & summarize',
  'Ôn bài trước khi đi ngủ': 'Review lessons before bedtime',
  'Viết chính tả / luyện chữ': 'Practice spelling / handwriting',
  'Hoàn thành bài tập online': 'Complete online exercises',
  'Tự học 1 chủ đề mới': 'Self-study a new topic',
  'Chuẩn bị bài cho ngày mai': 'Prepare lessons for tomorrow',
  'Học tập trung 45 phút (không xao nhãng)': 'Focused study for 45 minutes (no distractions)',
  
  // Việc khác - Việc nhà
  'Dọn giường sau khi ngủ dậy': 'Make bed after waking up',
  'Gấp quần áo': 'Fold clothes',
  'Dọn bàn học': 'Clean study desk',
  'Phụ giúp quét nhà': 'Help sweep the house',
  'Rửa chén (phụ giúp)': 'Wash dishes (help)',
  'Đổ rác': 'Take out trash',
  
  // Việc khác - Vận động
  'Tập thể dục 10 phút': 'Exercise for 10 minutes',
  'Tập thể dục 20 phút': 'Exercise for 20 minutes',
  'Chạy nhảy / vận động ngoài trời': 'Run / outdoor activities',
  'Chơi thể thao cùng gia đình': 'Play sports with family',
  'Uống đủ nước trong ngày': 'Drink enough water during the day',
  
  // Việc khác - Kỹ năng sống
  'Tự chuẩn bị cặp sách': 'Prepare school bag by yourself',
  'Tự mặc quần áo': 'Dress yourself',
  'Giúp bố/mẹ làm việc nhỏ': 'Help parents with small tasks',
  'Giữ phòng gọn gàng cả ngày': 'Keep room tidy all day',
  'Làm việc theo kế hoạch trong ngày': 'Follow daily plan',
  
  // Việc khác - Sáng tạo - Tinh thần
  'Vẽ tranh / tô màu': 'Draw / color',
  'Làm đồ thủ công': 'Make crafts',
  'Viết nhật ký 5 phút': 'Write journal for 5 minutes',
  'Kể chuyện cho bố/mẹ nghe': 'Tell story to parents',
  'Học chơi nhạc cụ 15 phút': 'Learn musical instrument for 15 minutes',
  'Học chơi nhạc cụ 30 phút': 'Learn musical instrument for 30 minutes',
  
  // Việc khác - Thói quen tốt
  'Đi ngủ đúng giờ': 'Go to bed on time',
  'Dậy đúng giờ': 'Wake up on time',
  'Không dùng thiết bị điện tử quá giờ': 'No electronic devices after hours',
}

/**
 * Get translated template title based on current language
 */
export function getTranslatedTemplateTitle(title: string, language: 'vi' | 'en'): string {
  if (language === 'vi') {
    return title // Return original Vietnamese title
  }
  // Return English translation if available, otherwise return original
  return templateTitleTranslations[title] || title
}

/**
 * Get translated task title (handles prefix format: "Nhiệm vụ ngày - Việc học - Title")
 */
export function getTranslatedTaskTitle(title: string, language: 'vi' | 'en'): string {
  if (language === 'vi') {
    return title // Return original Vietnamese title
  }
  
  // Check if title has prefix format: "Nhiệm vụ ngày/tuần/tháng - Việc học/khác - Template Title"
  const prefixPattern = /^(Nhiệm vụ (ngày|tuần|tháng)) - (Việc (học|khác)) - (.+)$/
  const match = title.match(prefixPattern)
  
  if (match) {
    // Has prefix format
    const [, , taskType, , categoryType, templateTitle] = match
    
    // Translate prefix parts
    const typeTranslations: Record<string, string> = {
      'ngày': 'Daily Task',
      'tuần': 'Weekly Task',
      'tháng': 'Monthly Task'
    }
    
    const categoryTranslations: Record<string, string> = {
      'học': 'Study',
      'khác': 'Other'
    }
    
    const translatedType = typeTranslations[taskType] || taskType
    const translatedCategory = categoryTranslations[categoryType] || categoryType
    const translatedTemplateTitle = getTranslatedTemplateTitle(templateTitle, language)
    
    return `${translatedType} - ${translatedCategory} - ${translatedTemplateTitle}`
  }
  
  // No prefix, try to translate directly
  return getTranslatedTemplateTitle(title, language)
}
