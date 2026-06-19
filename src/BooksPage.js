import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayBooks, setDisplayBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*');
    if (data) {
      setBooks(data);
      setDisplayBooks(data);
    }
  };

  const handleSearch = async () => {
    const user = supabase.auth.user();
    if (user && searchTerm.trim()) {
      await supabase.from('search_logs').insert([
        { user_id: user.id, keyword: searchTerm.trim() }
      ]);
    }
    // 前端过滤（根据书名包含搜索词）
    const filtered = books.filter(b => b.title.includes(searchTerm));
    setDisplayBooks(filtered);
  };
  
  return (
    <div>
      <h2>书籍列表</h2>
      <input 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
        placeholder="搜索书名..."
      />
      <button onClick={handleSearch}>搜索</button>
      {displayBooks.map(book => (
        <div key={book.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
          <img src={book.cover_url} alt={book.title} width="80" />
          <h3>{book.title}</h3>
          <p>{book.author} - 评分：{book.avg_rating || '暂无'}</p>
          <a href={book.download_url} target="_blank" rel="noreferrer">下载</a>
        </div>
      ))}
    </div>
  );
}
export default BooksPage;