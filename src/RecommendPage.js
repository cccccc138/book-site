import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function RecommendPage() {
  const [recBooks, setRecBooks] = useState([]);
  const user = supabase.auth.user();

  useEffect(() => {
    const getRecommend = async () => {
      if (!user) return;
      const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString();
      // 获取用户近30天搜索日志
      const { data: logs } = await supabase
        .from('search_logs')
        .select('keyword')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo);
      if (!logs) return;

      // 统计高频词
      const wordCount = {};
      logs.forEach(log => {
        const w = log.keyword;
        wordCount[w] = (wordCount[w] || 0) + 1;
      });
      const highFreq = Object.entries(wordCount)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 10)
        .map(e => e[0]);

      if (highFreq.length === 0) {
        // 冷启动：返回评分最高的书
        const { data: top } = await supabase.from('books').select('*').order('avg_rating', { ascending: false }).limit(20);
        if (top) setRecBooks(top);
        return;
      }

      // 获取所有书
      const { data: allBooks } = await supabase.from('books').select('*');
      if (!allBooks) return;
      // 过滤：书籍 keywords 与高频词有交集
      const matched = allBooks.filter(book => {
        if (!book.keywords || book.keywords.length === 0) return false;
        return book.keywords.some(k => highFreq.includes(k));
      });
      // 按匹配数量排序
      matched.sort((a, b) => {
        const aMatch = a.keywords.filter(k => highFreq.includes(k)).length;
        const bMatch = b.keywords.filter(k => highFreq.includes(k)).length;
        return bMatch - aMatch;
      });
      setRecBooks(matched.slice(0, 20));
    };
    getRecommend();
  }, [user]);

  return (
    <div>
      <h2>为你推荐</h2>
      {recBooks.map(book => (
        <div key={book.id}>{book.title}</div>
      ))}
    </div>
  );
}
export default RecommendPage;