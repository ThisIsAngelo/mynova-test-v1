/**
 * Fungsi sederhana untuk mengekstrak heading dari HTML string.
 * Output: Array of objects { level: number, text: string, id?: string }
 */
export function extractHeadings(htmlContent: string) {
  if (!htmlContent) return [];

  // Regex untuk menangkap <h1>...</h1> sampai <h3>...</h3>
  // Penjelasan Regex: <h([1-3]) -> Tangkap h1, h2, atau h3
  // (.*?) -> Tangkap atribut lain (misal style/class)
  // >(.*?)<\/h\1> -> Tangkap isi teksnya
  const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h\1>/g;
  
  const headings = [];
  let match;

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    // Bersihkan tag HTML lain yang mungkin ada di dalam heading (misal <b>bold</b>)
    const cleanText = match[2].replace(/<[^>]+>/g, '');
    
    headings.push({
      level: parseInt(match[1]), // 1, 2, atau 3
      text: cleanText,
      // Kita bisa generate ID simple untuk anchor link nanti di frontend
      // (Di frontend nanti TipTap juga bisa generate ID, tapi ini backup data)
    });
  }

  return headings;
}