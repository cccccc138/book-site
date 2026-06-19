import { useState } from 'react';
import { supabase } from './supabaseClient';

function BookDetail({ book }) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [progress, setProgress] = useState(0);
  const user = supabase.auth.user();

  const handleComment = async () => {
    if (!user) return alert('请先登录');
    // 简单的关键词提取（中文需分词库，这里先用空格分词示意）
    const words = comment.split(/\s+/).slice(0, 5);
    const { error } = await supabase.from('reviews').insert([
      {
        book_id: book.id,
        user_id: user.id,
        content: comment,
        extracted_keywords: words
      }
    ]);
    if (error) alert(error.message);
    else {
      alert('评论成功');
      setComment('');
      // 更新书籍关键词（简化处理，可直接覆盖）
      await updateBookKeywords(book.id);
    }
  };

  const handleRate = async () => {
    if (!user) return;
    // 检查是否已评分
    const { data: existing } = await supabase
      .from('ratings')
      .select('*')
      .eq('book_id', book.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      alert('你已经评过分了');
      return;
    }
    const { error } = await supabase.from('ratings').insert([
      { book_id: book.id, user_id: user.id, score: rating }
    ]);
    if (error) alert(error.message);
    else {
      alert('评分成功');
      // 重新计算平均分
      const { data: allRatings } = await supabase.from('ratings').select('score').eq('book_id', book.id);
      if (allRatings) {
        const sum = allRatings.reduce((acc, r) => acc + r.score, 0);
        const avg = sum / allRatings.length;
        await supabase.from('books').update({ avg_rating: avg }).eq('id', book.id);
      }
    }
  };

  const handleProgress = async () => {
    if (!user) return;
    // 更新或插入进度
    const { error } = await supabase.from('reading_progress').upsert([
      { book_id: book.id, user_id: user.id, percent: progress, updated_at: new Date() }
    ], { onConflict: 'book_id, user_id' });
    if (error) alert(error.message);
    else alert('进度保存成功');
  };

  // 辅助：更新书籍关键词（合并所有评论的关键词）
  const updateBookKeywords = async (bookId) => {
    const { data: reviews } = await supabase.from('reviews').select('extracted_keywords').eq('book_id', bookId);
    if (reviews) {
      const allWords = reviews.flatMap(r => r.extracted_keywords);
      // 简单去重，取前10个
      const uniqueWords = [...new Set(allWords)].slice(0, 10);
      await supabase.from('books').update({ keywords: uniqueWords }).eq('id', bookId);
    }
  };

  return (
    <div>
      <div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="写评论..." />
        <button onClick={handleComment}>提交评论</button>
      </div>
      <div>
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} 星</option>)}
        </select>
        <button onClick={handleRate}>评分</button>
      </div>
      <div>
        <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} />
        <button onClick={handleProgress}>保存进度</button>
      </div>
    </div>
  );
}
export default BookDetail;